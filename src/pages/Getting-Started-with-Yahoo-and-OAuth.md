---
title: Getting Started with Yahoo and OAuth
layout: ../components/Layout.astro
created: "2010-1-29"
description: "AAAARRRRGGGHHH!!I had to get that out of my system. I’m not familiar enough with the exact specification of OAuth to know whether it’s Yahoo or Yedda that can’t read a spec, but the Yedda implementation of OAuth available on Google Code, doesn’t even begin to work, work …"
---

AAAARRRRGGGHHH!!

I had to get that out of my system. I’m not familiar enough with the exact specification of OAuth to know whether it’s Yahoo or Yedda that can’t read a spec, but the Yedda implementation of OAuth available on Google Code, doesn’t even begin to work with Yahoo’s YQL API. Futhermore, the Yedda implementation is bloated and hard to follow. Why is it that so many programmers feel the need to over complicate EVEYRTHING.

So… Here’s my rewrite of the Yedda implemenation. It works out-of-the-box. There are no objects to instantiate, just 4 very simple static methods to use. A word of caution, System.Net.WebClient cannot be used to talk to Yahoo.

Update (1/29/2010): See a complete working example of [C# / OAuth / Yahoo YQL](/demos/files/YqlTest.zip).

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace WAN.Lib {
    public static class OAuth {
        private static Random _Random = new Random();
        private static string _UnreservedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~";
        public const string HMACSHA1 = "HMAC-SHA1";

        public static byte[] Download(string url, string consumerKey, string consumerSecret) {
            return Download(null, null, url, consumerKey, consumerSecret);
        }

        public static byte[] Download(string method, string hashAlgorithm, string url, string consumerKey, string consumerSecret) {
            url = GetUrl(method, hashAlgorithm, url, consumerKey, consumerSecret);

            var req = HttpWebRequest.Create(url);
            if (method != null) req.Method = method;

            using(var mem = new System.IO.MemoryStream())
            using (var response = req.GetResponse()) {
                var stream = response.GetResponseStream();
                int read = 1;
                byte[] buffer = new byte[8092];
                while (read > 0) {
                    read = stream.Read(buffer, 0, buffer.Length);
                    mem.Write(buffer, 0, read);
                }
                return mem.ToArray();
            }
        }

        public static string GetUrl(string url, string consumerKey, string consumerSecret) {
            return GetUrl(null, null, url, consumerKey, consumerSecret);
        }

        public static string GetUrl(string method, string hashAlgorithm, string url, string consumerKey, string consumerSecret) {
            method = method ?? "GET";
            hashAlgorithm = hashAlgorithm ?? HMACSHA1;

            string timestamp = Math.Floor((DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds).ToString();
            string nonce = GetRandomString(10);

            int index = url.IndexOf('?');
            string querystring;
            if (index == -1) {
                querystring = string.Empty;
            } else {
                querystring = url.Substring(index + 1);
                url = url.Substring(0, index);
            }

            //parse the querystring into a dictionary, rather than NameValueCollection, so it's easier to manipulate
            Dictionary<string, string=""> query = querystring.Split('&').Select(x => {
                int i = x.IndexOf('=');
                if (i == -1) return new[] { x, null };
                else return new[] { x.Substring(0, i), Uri.UnescapeDataString(x.Substring(i + 1)) };
            }).ToDictionary(x => x[0], y => y[1]);

            //add the oauth stuffs
            query.Add("oauth_consumer_key", consumerKey);
            query.Add("oauth_nonce", nonce);
            query.Add("oauth_signature_method", "HMAC-SHA1");
            query.Add("oauth_timestamp", timestamp);
            query.Add("oauth_version", "1.0");

            //put the querystring back together in alphabetical order
            querystring = string.Join("&", query.OrderBy(x => x.Key).Select(x => string.Concat(x.Key, (x.Value == null ? string.Empty : "=" + x.Value.UrlEncode()))).ToArray());

            string data = string.Concat(method.ToUpper(), "&", url.UrlEncode(), "&", querystring.UrlEncode());

            string sig;
            using (var hasher = GetHashAglorithm(hashAlgorithm)) {
                hasher.Key = (consumerSecret + "&").GetBytes();
                sig = hasher.ComputeHash(data.GetBytes()).ToBase64();
            }

            return string.Concat(url, "?", querystring, "&oauth_signature=", sig.UrlEncode());
        }

        private static KeyedHashAlgorithm GetHashAglorithm(string name) {
            switch (name) {
                case HMACSHA1: return new HMACSHA1();
                default: throw new NotSupportedException(string.Format("The specified type, {0}, is not supported."));
            }
        }

        private static byte[] GetBytes(this string input) {
            return System.Text.Encoding.ASCII.GetBytes(input);
        }

        private static string ToBase64(this byte[] input) {
            return Convert.ToBase64String(input);
        }

        private static string GetRandomString(int length) {
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < length; i++) result.Append(_UnreservedChars[_Random.Next(0, 25)]);
            return result.ToString();
        }

        /// <summary>
        /// This is a different Url Encode implementation since the default .NET one outputs the percent encoding in lower case.
        /// While this is not a problem with the percent encoding spec, it is used in upper case throughout OAuth
        /// </summary>
        /// <param name="value">The value to Url encode
        /// <returns>Returns a Url encoded string</returns>
        public static string UrlEncode(this string value) {
            StringBuilder result = new StringBuilder();
            foreach (char symbol in value) {
                if (_UnreservedChars.IndexOf(symbol) != -1) {
                    result.Append(symbol);
                } else {
                    result.AppendFormat("%{0:X2}", (int)symbol);
                }
            }

            return result.ToString();
        }
    }
}
```
