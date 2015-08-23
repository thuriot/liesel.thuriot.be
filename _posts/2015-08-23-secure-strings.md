---
layout: post
title: Secure Strings
date: 2015-08-23 18:59:00
cover: //cdn.thuriot.be/images/Covers/security.jpg
categories: [C#, Unsafe, Password]
---

A lot of programs use some form of passwords. These are usually kept in memory. The issue here is that a program's used memory is very easy to read out and your unsecured password will be there in plain sight.

For this specific reason, the [`SecureString` (`System.Security`)](https://msdn.microsoft.com/en-us/library/system.security.securestring.aspx) class is available, which will keep your string encrypted in memory.

Since this class does not have an apparent constructor that receives a `string`, people tend to create an empty `SecureString`, iterate their string and call `AppendChar` for each and every iteration. Not only is this a tedious process, the .NET framework will have to unprotect the value each time and protect it again after adding the `char`. The good news, though, is that this entire process is done in unmanaged memory.

This whole process, however, can be done in a much easier way, by using `unsafe` code (tick the option to enable it in your project settings). This will enable you to create a char pointer (`char*`) to your string and pass it to the `SecureString` constructor as follows:


```csharp
    unsafe static class UnsafeExtensions
    {
        public static SecureString ToSecureString(this string password)
        {
            fixed (char* passwordChars = password)
            {
                var securePassword = new SecureString(passwordChars, password.Length);
                securePassword.MakeReadOnly();

                return securePassword;
            }
        }
    }

```

Don't forget to mark it as read-only when you're done to prevent it from being modified.

Getting your string back, is just as easy and can be done by calling `SecureStringToGlobalAllocUnicode`:

```csharp
    unsafe static class UnsafeExtensions
    {
        public static string ToUnsecureString(this SecureString securePassword)
        {
            IntPtr unmanagedString = IntPtr.Zero;
            try
            {
                unmanagedString = Marshal.SecureStringToGlobalAllocUnicode(securePassword);
                return Marshal.PtrToStringUni(unmanagedString);
            }
            finally
            {
                Marshal.ZeroFreeGlobalAllocUnicode(unmanagedString);
            }
        }
    }

```

One could, however, argue that you don't have control over how long that string will remain in your memory. Instead of working with a string, we could work with a byte array instead. This will be easy to clear from memory afterwards.

We could go a step further and automate the process as follows:

```csharp
    unsafe static class UnsafeExtensions
    {
        [DllImport("msvcrt.dll", EntryPoint = "memcpy", CallingConvention = CallingConvention.Cdecl, SetLastError = false)]
        static extern IntPtr memcpy(void* dest, void* src, int count);

        public static T Process<T>(this SecureString input, Func<byte[], T> process)
        {
          var ptr = IntPtr.Zero;
          byte[] bytes = null;

          try
          {
              ptr = Marshal.SecureStringToBSTR(input);

              bytes = new byte[input.Length * sizeof(char)];
              fixed (void* b = bytes)
                  memcpy(b, ptr.ToPointer(), bytes.Length);

              return process(bytes);
          }
          finally
          {
              if (bytes != null)
                  bytes.Clear();

              if (ptr != IntPtr.Zero) Marshal.ZeroFreeBSTR(ptr);
          }
    }
```
