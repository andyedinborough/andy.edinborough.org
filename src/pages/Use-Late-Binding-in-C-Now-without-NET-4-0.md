---
title: Use Late Binding in C# Now, without .NET 4.0
layout: ../components/Layout.astro
created: "2009-6-17"
description: "The lack of late-binding in C# has been one of my biggest gripes about C#. Finally, in the .NET Framework v4.0, the dynamic keyword has been introduced (it could be argued that it is too loose—allowing for variant types). But until it is released, the need still exists, exists …"
---

The lack of late-binding in C# has been one of my biggest gripes about C#. Finally, in the .NET Framework v4.0, the dynamic keyword has been introduced (it could be argued that it is too loose—allowing for variant types). But until it is released, the need still exists, and even then, not all clients will immediately support it. So, in a bind, I wrote a simple class to allow access to objects via late-binding in C#.

The trick to figuring out how to write the code came from using Reflector to decompile some VB.NET code… (I love reverse-engineering :]). The answer is that the VB compiler makes use of an area of the .NET Framework within the Microsoft.VisualBasic assembly that is marked with the attribute [EditorBrowsable(EditorBrowsableState.Never)] to prevent people from discovering it.

Here’s an example that uses my Late-Binding code to open an Excel Spreadsheet and convert it to a CSV:

```csharp
class Excel : IDisposable {
    Late app = new Late("Excel.Application");
    Late book, sheet;
    public Excel() {
        app.PropSet("Visible", false);
    }
    public void Open(string filename) {
        if (book != null) book.Method("Close", false, null, null);
        book = app.PropLate("Workbooks").MethodLate("Open", filename, 0, true, 5, "", "", false, 2, "",
          true, false, 0, true, false, false);
    }
    public void SelectSheet(int which) {
        sheet = app.PropIndexLate("Worksheets", which);
    }
    public void SaveAs(string filename, int format) {
        sheet.Method("SaveAs", filename, format, Missing.Value, Missing.Value,
            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Missing.Value, Missing.Value);
    }
    public void Dispose() {
        book.Method("Close", false, null, null);
        app.Method("Quit");
    }
}
```

The code itself—not ugly, not beautiful, but hey, it works:

```csharp
using System;
namespace AE {
        class Late {
                object _obj;
                public Late(string className) {
                        try {
                                _obj = Microsoft.VisualBasic.Interaction.GetObject(null, className);
                        } catch (Exception) {
                                _obj = Microsoft.VisualBasic.Interaction.CreateObject(className, null);
                        }
                }
                private Late() {}
                public static Late Create(object obj) {
                        if (obj == null)
                                return null;
                        else
                                return new Late() { _obj = obj };
                }
                public Late PropLate(string propName) {
                        return Late.Create(Prop(propName));
                }
                public object Prop(string propName) {
                        return Microsoft.VisualBasic.CompilerServices.NewLateBinding.LateGet(_obj, null, propName, new object[] { }, null, null, null);
                }
                public void PropSet(string propName, object value) {
                        Microsoft.VisualBasic.CompilerServices.NewLateBinding.LateSet(_obj, null, propName, new object[] { value }, null, null);
                }
                public Late PropIndexLate(string propName, params object[] indexParams) {
                        return Late.Create(PropIndex(propName, indexParams));
                }
                public object PropIndex(string propName, params object[] indexParams) {
                        return Microsoft.VisualBasic.CompilerServices.NewLateBinding.LateGet(_obj, null, propName, indexParams, null, null, null);
                }
                public T Prop<T>(string propName, T defaultValue) {
                        try {
                                T val = (T)Prop(propName);
                                if (object.Equals(val, default(T)))
                                        return defaultValue;
                                else
                                        return val;
                        } catch (Exception) {
                                return defaultValue;
                        }
                }
                public Late MethodLate(string method, params object[] parameters) {
                        return Late.Create(Method(method, parameters));
                }
                public object Method(string method, params object[] parameters) {
                        return Microsoft.VisualBasic.CompilerServices.NewLateBinding.LateCall(_obj, null, method, parameters, null, null, null, false);
                }
        }
}
```

[Download a complete, working solution here](/demos/files/late.zip)
