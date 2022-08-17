---
title: Reading Entity Framework Code First Objects from a Stored Procedure
layout: ../components/Layout.astro
created: "2010-11-1"
description: "I may be a nerd (that is, a geek who get’s paid), but I don’t enjoy writing stored procedures.  However, in working with the Entity Framework, I’ve found that doing complex and often repeated queries of my Entity Framework sets is rather inefficient.  My complete round, round …"
---

I may be a nerd (that is, a geek who get’s paid), but I don’t enjoy writing stored procedures. However, in working with the Entity Framework, I’ve found that doing complex and often repeated queries of my Entity Framework sets is rather inefficient. My complete round-trip page loads (generate and execute query, then produce HTML) takes about 1,000ms on average. So I wanted to replace this ugly query with a simple stored procedure—precompiled, ready to fire, and highly optimized for my specific query, while still having the ability to do ad-hoc queries.

So at PDC10 I made sure to talk to the EF boys and they pointed me to the System.Data.Objects.ObjectContext.Translate method. This little bad boy will take a DataReader and create an enumerable of my objects from it—perfect.

Let’s walk through the “gotchas”. In my example below, I have a class named Product. I want to do a search for products based on some text query, and have the stored procedure handle paging—which means it will also have to tell many how many total products were matched. Below is a very simplified version of the query I needed to run:

```csharp
public Tuple<int, IEnumerable<Product>> SearchProducts(string q = null, int page = 1, int count = 25) {
    var words = Regex.Matches(q, "[a-z0-9]+", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
        .Cast<System.Text.RegularExpressions.Match>()
        .Select(x => x.Value);

    int total;
    IEnumerable<Product> products = null;
    var conn = Database.Connection;
    try {
        conn.Open();

        using (var cmd = conn.CreateCommand()) {
            cmd.CommandText = "Search";
            cmd.CommandType = System.Data.CommandType.StoredProcedure;


            //q represents a table-valued parameter (SQL Server 2008 and later)
            //ToDataTable takes my list of words and makes DataTable from it
            AddParameter(cmd, "q", ToDataTable(words));
            AddParameter(cmd, "count", count);
            AddParameter(cmd, "page", page);

            //In order for relationships to other entities to be handled, we have to pass in the name of the entity set.

            if (_ProductEntitySetName == null) _ProductEntitySetName = GetEntitySetName<Product>();

            using (var rdr = cmd.ExecuteReader()) {
                rdr.Read();
                total = rdr.GetInt32(0);
                if (total > 0 && count > 0)
                    products = ObjectContext.Translate<Product>(rdr, _ProductEntitySetName,
                         System.Data.Objects.MergeOption.NoTracking) //I just need a read-only list for viewing, so I won’t worry about change tracking
                         .ToArray(); //the objects need to be read out of the DbReader before it is closed
            }
        }
    } finally {
        conn.Close();
    }

    return Tuple.Create(count, products ?? new Product[0]);

}

public static void AddParameter(this System.Data.Common.DbCommand cmd, string name, object value, System.Data.DbType? type = null) {

    var param = cmd.CreateParameter();
    param.ParameterName = name;
    param.Value = value ?? DBNull.Value;
    if (type != null)
        param.DbType = type.Value;
    cmd.Parameters.Add(param);

}

public static DataTable ToDataTable<T>(this IEnumerable<T> list) {
var table = new DataTable();
table.Columns.Add("value", typeof(T));
if(list != null)
foreach (var obj in list)
table.Rows.Add(new object[] { obj });
return table;
}

private static string \_ProductEntitySetName;

/// <summary>
/// Returns the set name for a given entity type (http://social.msdn.microsoft.com/Forums/en-US/adodotnetentityframework/thread/7a29d4e3-8550-43dd-aa09-2bb859466c0d)
/// </summary>
/// <typeparam name="T">The entity type</typeparam>
private string GetEntitySetName<T>() {
return ObjectContext.MetadataWorkspace.GetEntityContainer(ObjectContext.DefaultContainerName, System.Data.Metadata.Edm.DataSpace.CSpace)
.BaseEntitySets.Where(bes => bes.ElementType.Name == typeof(T).Name).FirstOrDefault().Name;
```
