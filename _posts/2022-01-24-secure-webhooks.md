---
layout: post
title: Secure Webhooks
date: 2022-01-24 19:12:00
cover: //cdn.thuriot.be/images/Covers/hash.jpg
categories: [C#, Hash, Webhooks]
---

Security is always a tricky one. Especially when it comes to webhooks, it can be difficult to make sure that the payload being received is a valid one. For some API's, a service-to-service token can easily be set up, but when dealing with public api's, it's not always that simple.

Dealing with this issue, I had a quick glance at how GitHub solves this issue and it's quite ingenious. They basically compute a Hash-based Message Authentication Code (HMAC) by using the SHA256 hash function for each payload they're sending, using a common secret. To validate the payload, you just calculate the same HMAC using your common secret. If it matches, the payload is valid! If not, ignore and return an error code from your api.

Doing this is actually pretty simple. First, let's send out our own payload from our API:

```csharp
//GitHub's signature name, feel free to use your own!
const string HookSignatureHeader = "X-Hub-Signature-256";

string payload = SerializeToJson(body);
byte[] payloadBytes = Encoding.UTF8.GetBytes(payload);

var headerValue = CreateHeaderValue(secret, payloadBytes);

var content = new StringContent(payload, Encoding.UTF8, "application/json");
content.Headers.Add(HookSignatureHeader, headerValue);
```

Additionally, just as usefull is to add some metadata in the headers:

```csharp
content.Headers.Add("X-Hook-Event", "MyWebHookEventType");
```

This way, the consumers of your API can just skip the validation/deserialization/... of your payload when they're not interested in that specific event.

Validation would work in a very similar way:

```csharp
//Optionally check "X-Hook-Event" header for starters to see if we're even interested in this event at all.

if (!Request.Headers.TryGetValue(headerName, out var values))
{
    return Unauthorized();
}

var signature = values.ToString();

//Prefixing makes for an additional cheap check
const string SignaturePrefix = "sha256=";
if (signature?.StartsWith(SignaturePrefix, StringComparison.OrdinalIgnoreCase) != true)
{
    return Unauthorized();
}

using var ms = new MemoryStream();
await Request.Body.CopyToAsync(ms); //Or BodyReader if you're not in netstandard / Abstractions.

var payload = ms.ToArray();

var validationSignature = CreateHeaderValue(secret, payload);

if (!StringComparer.OrdinalIgnoreCase.Equals(signature, validationSignature))
{
    return Unauthorized();
}

//Payload is valid, deserialize and handle...
var body = Encoding.UTF8.GetString(payload);
var payloadEntity = DeserializeFromJson(body);
```

Since we already read the full body stream here, you don't have to declare a `[FromBody]` attribute on your API to avoid the payload being deserialized early. Not only can you not validate the deserialized payload (your serializer settings might differ resulting in a different HMAC), this provides some additional performance optimization since invalid payloads and irrelevant headers won't be deserialized or read at all!

Calculating the actual header is only a few lines in newer .NET versions:

```csharp
private static string CalculateSignature(string secret, byte[] payloadBytes)
{
    byte[] secretBytes = Encoding.ASCII.GetBytes(secret);
    using var sha = new HMACSHA256(secretBytes);

    byte[] hash = sha.ComputeHash(payloadBytes);

    return SignaturePrefix + Convert.ToHexString(hash);
}
```

Or In case you're writing this in netstandard, which doesn't have the `Convert.ToHexString` call yet:

```csharp
private static string CalculateSignature(string secret, byte[] payloadBytes)
{
    byte[] secretBytes = Encoding.ASCII.GetBytes(secret);
    using var sha = new HMACSHA256(secretBytes);

    byte[] hash = sha.ComputeHash(payloadBytes);

    var builder = new StringBuilder((hash.Length * 2) + SignaturePrefix.Length);

    builder.Append(SignaturePrefix);

    for (int i = 0; i < hash.Length; i++)
    {
        builder.AppendFormat("{0:X2}", hash[i]);
    }

    return builder.ToString();
}
```

A sample GitHub repo for this can be found [here](https://github.com/StevenThuriot/SecureWebhooks). Happy validating!