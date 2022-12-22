using System;
using System.Security.Cryptography;

namespace MonopolyClone.Auth.CryptTools;


public class AesEncryptor
{
    private static AesEncryptor? _instance;

    /// <summary>
    /// Initialize the AesEncryptor instance.
    /// Expected to be called after loading the private key from the environment variables
    /// </summary>
    /// <returns></returns>
    public static void Initialize()
    {
        _instance = new AesEncryptor();
    }

    public static AesEncryptor Instance
    {
        get
        {
            if (_instance == null)
                throw new ArgumentException("Trying to AesEncryptor Instance without being initialized first!");

            return _instance;
        }
    }
    private readonly byte[] _key;

    public byte[] StringToByteArray(string hex)
    {
        return Enumerable.Range(0, hex.Length)
                         .Where(x => x % 2 == 0)
                         .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                         .ToArray();
    }

    public AesEncryptor()
    {
        // Key must be given in hex format, and when decoded have exactly 32 bytes.
        var keystring = Environment.GetEnvironmentVariable("ENCRYPTIONKEY");
        if (keystring == null)
            throw new ArgumentNullException("No encryption key found in environment variables!, cannot proceed.");

        byte[] key;
        try
        {
            key = StringToByteArray(keystring);
        }
        catch (Exception e)
        {
            throw new ArgumentException("Error why trying to parse key hex bytes!" + e);
        }

        if (key.Length != 32)
        {
            throw new ArgumentException("Key length must be 32 bytes!");
        }

        _key = key;
    }

    public string Encrypt(string plainText)
    {
        // Check arguments.
        if (plainText == null || plainText.Length <= 0)
            throw new ArgumentNullException(nameof(plainText));

        byte[] encrypted;

        byte[] IV;
        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.BlockSize = 128;
            aesAlg.KeySize = 256;
            aesAlg.Padding = PaddingMode.PKCS7;
            aesAlg.Mode = CipherMode.CBC;

            aesAlg.Key = _key;
            aesAlg.GenerateIV();

            IV = aesAlg.IV;


            // Create an encryptor to perform the stream transform.
            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, IV);

            // Create the streams used for encryption.
            using (MemoryStream msEncrypt = new MemoryStream())
            {
                using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                {
                    using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                    {
                        //Write all data to the stream.
                        swEncrypt.Write(plainText);
                    }
                    encrypted = msEncrypt.ToArray();
                }
            }
        }

        // Return the encrypted bytes as hexstring
        var prebytes = IV.Concat(encrypted).ToArray(); // send IV at start
        return Convert.ToBase64String(prebytes);
    }

    public string Decrypt(string hexcipher)
    {
        // Check arguments.
        if (hexcipher == null || hexcipher.Length <= 0)
            throw new ArgumentNullException(nameof(hexcipher));

        byte[] hexbytes;
        // get bytes
        try
        {
            hexbytes = Convert.FromBase64String(hexcipher);
        }
        catch (Exception)
        {
            return "";
        }

        // take IV initially.
        var IV = new ArraySegment<byte>(hexbytes, 0, 16).ToArray();

        var cipherText = new ArraySegment<byte>(hexbytes, 16, hexbytes.Length - 16).ToArray();

        // Declare the string used to hold
        // the decrypted text.
        string? plaintext = null;

        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.BlockSize = 128;
            aesAlg.KeySize = 256;
            aesAlg.Padding = PaddingMode.PKCS7;
            aesAlg.Mode = CipherMode.CBC;

            aesAlg.Key = _key;
            aesAlg.IV = IV;

            // Create a decryptor to perform the stream transform.
            ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

            // Create the streams used for decryption.
            using (MemoryStream msDecrypt = new MemoryStream(cipherText))
            {
                using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                {
                    using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                    {

                        // Read the decrypted bytes from the decrypting stream
                        // and place them in a string.
                        plaintext = srDecrypt.ReadToEnd();
                    }
                }
            }
        }

        return plaintext;
    }
}