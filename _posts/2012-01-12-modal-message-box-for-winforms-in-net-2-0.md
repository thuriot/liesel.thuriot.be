---
layout: post
title: Modal Message Box for WinForms in .NET 2.0+
date: 2012-01-12 19:40:00
categories: [.NET, C#, Helper, LightBox]
---

The other day at work I felt the need to show the user a message, but wanted to do it a bit more fancy than just use the regular, old, boring MessageBox. 

I personally really enjoy the "LightBox effect" where the background darkens and the LightBox popped up. Because of the way WinForms work, this wasn't as simple as I was hoping it would be. I worked out a little solution and decided to share.

```csharp
public class ModalMessageBox : Form
{
    private ModalMessageBox(Form parent, string message, MessageBoxButtons buttons, Font font)
    {
        if (parent == null)
            throw new ArgumentNullException("parent");

        if (string.IsNullOrEmpty(message))
            throw new ArgumentNullException("message");

        if (font == null)
            throw new ArgumentNullException("font");

        InitializeComponent(parent, message, buttons, font);
    }
        
    private void InitializeOKButton(Form parent)
    {
        var okButton = new Button
                            {
                                Anchor = (((AnchorStyles.Bottom | AnchorStyles.Right))),
                                Size = new Size(99, 23),
                                TabIndex = 1,
                                Text = "OK",
                                UseVisualStyleBackColor = true,
                                DialogResult = DialogResult.OK,
                            };

        okButton.Location = new Point(parent.ClientSize.Width - okButton.Size.Width - 11,
                                        parent.ClientSize.Height - okButton.Size.Height - 11);


        Controls.Add(okButton);
    }

    private void InitializeYesNoButtons(Form parent)
    {
        var noButton = new Button
                            {
                                Anchor = (((AnchorStyles.Bottom | AnchorStyles.Right))),
                                Size = new Size(99, 23),
                                TabIndex = 2,
                                Text = "No",
                                UseVisualStyleBackColor = true,
                                DialogResult = DialogResult.No
                            };

        noButton.Location = new Point(parent.ClientSize.Width - noButton.Size.Width - 11,
                                        parent.ClientSize.Height - noButton.Size.Height - 11);

        Controls.Add(noButton);

        var yesButton = new Button
                            {
                                Anchor = (((AnchorStyles.Bottom | AnchorStyles.Right))),
                                Size = new Size(99, 23),
                                TabIndex = 1,
                                Text = "Yes",
                                UseVisualStyleBackColor = true,
                                DialogResult = DialogResult.Yes
                            };

        yesButton.Location = new Point(parent.ClientSize.Width - yesButton.Size.Width - noButton.Width - 16,
                                        parent.ClientSize.Height - yesButton.Size.Height - 11);

        Controls.Add(yesButton);
    }

    private void InitializeComponent(Form parent, string message, MessageBoxButtons buttons, Font font)
    {
        SuspendLayout();

        var questionLabel = new Label
                                {
                                    Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right,
                                    BackColor = Color.White,
                                    BorderStyle = BorderStyle.FixedSingle,
                                    Font = font,
                                    ForeColor = Color.Black,
                                    ImeMode = ImeMode.NoControl,
                                    Location = new Point(10, 42),
                                    TabIndex = 3,
                                    Text = message,
                                    TextAlign = ContentAlignment.MiddleCenter
                                };

        var height = parent.ClientSize.Height - 78;

        if (height > 300)
            height = 300;

        questionLabel.Size = new Size(parent.ClientSize.Width - 20, height);
            
        MaximizeBox = false;
        MinimizeBox = false;
        ShowInTaskbar = false;
        SizeGripStyle = SizeGripStyle.Hide;
        FormBorderStyle = FormBorderStyle.None;

        StartPosition = FormStartPosition.Manual;
        ClientSize = new Size(parent.ClientSize.Width + 2, parent.ClientSize.Height + 2);

        Rectangle screenRectangle = parent.RectangleToScreen(parent.ClientRectangle);
        int titleHeight = screenRectangle.Top - parent.Top;
        int borderWidth = screenRectangle.Left - parent.Left;

        Location = new Point(parent.Location.X + borderWidth - 1, parent.Location.Y + titleHeight - 1);
            
        TransparencyKey = Color.LightSteelBlue;

        var hatchBrush = new HatchBrush(HatchStyle.Percent50, TransparencyKey);
        var backgroundImage = new Bitmap(50, 50);

        Graphics imageGraphics = Graphics.FromImage(backgroundImage);
        imageGraphics.FillRectangle(hatchBrush, DisplayRectangle);

        AllowTransparency = true;
        backgroundImage.MakeTransparent(TransparencyKey);

        BackColor = TransparencyKey;
        BackgroundImage = backgroundImage;
        BackgroundImageLayout = ImageLayout.Tile;
            
        Controls.Add(questionLabel);

        switch (buttons)
        {
            case MessageBoxButtons.OK:
                InitializeOKButton(parent);
                break;
            case MessageBoxButtons.YesNo:
                InitializeYesNoButtons(parent);
                break;
            default:
                throw new ArgumentOutOfRangeException("buttons");
        }

        ResumeLayout(false);
    }

    public static DialogResult Show(Form parent, string message)
    {
        return Show(parent, message, MessageBoxButtons.OK);
    }

    public static DialogResult Show(Form parent, string message, MessageBoxButtons buttons)
    {
        return Show(parent, message, buttons, parent.Font);
    }

    private delegate DialogResult ShowDelegate(Form parent, string message, MessageBoxButtons buttons, Font font);
        
    private static readonly ShowDelegate InternalShow = 
        (parent, message, buttons, font) => new ModalMessageBox(parent, message, buttons, font).ShowDialog(parent);

    public static DialogResult Show(Form parent, string message, MessageBoxButtons buttons, Font font)
    {
        if (parent.InvokeRequired)
        {
            var result = parent.Invoke(InternalShow, parent, message, buttons, font);
            return (DialogResult) result;
        }

        return InternalShow(parent, message, buttons, font);
    }
}
```

The result looks like this:

Before the pop-up
[![Input before the message pops up](//cdn.thuriot.be/images/ModalMessageBox/Input1.png)](//cdn.thuriot.be/images/ModalMessageBox/Input1.png)

After the pop-up
[![Input after the message pops up](//cdn.thuriot.be/images/ModalMessageBox/Input2.png)](//cdn.thuriot.be/images/ModalMessageBox/Input2.png)