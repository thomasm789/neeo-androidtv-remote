// Import forge module for generating key pairs and certificates
import forge from "node-forge";
// Import crypto module for generating random bytes
import crypto from "crypto";

// Define the CertificateGenerator class
export class CertificateGenerator {

    // Static method that generates a certificate with a set of given attributes
    static generateFull(name, country, state, locality, organisation, OU){
        // Generate RSA key pair with 2048 bit keys
        let keys = forge.pki.rsa.generateKeyPair(2048);
        // Create a new certificate
        let cert = forge.pki.createCertificate();
        // Assign the public key from the generated key pair to the certificate
        cert.publicKey = keys.publicKey;
        // Generate a unique serial number for the certificate
        cert.serialNumber = '01' + crypto.randomBytes(19).toString("hex");
        // Set the certificate's validity start date to now
        cert.validity.notBefore = new Date();
        // Create a new date object and set it to the year 2099
        let date = new Date();
        date.setUTCFullYear(2099);
        // Set the certificate's validity end date to the year 2099
        cert.validity.notAfter = date;

        // Define the subject of the certificate using the provided parameters
        let attributes = [
            {name: 'commonName', value: name},
            {name: 'countryName', value: country},
            {shortName: 'ST', value: state},
            {name: 'localityName', value: locality},
            {name: 'organizationName', value: organisation},
            {shortName: 'OU', value: OU}
        ];
        // Set the subject of the certificate
        cert.setSubject(attributes);
        // Sign the certificate using the private key from the generated key pair
        cert.sign(keys.privateKey, forge.md.sha256.create());

        // Return the PEM formatted certificate and private key
        return {
            cert : forge.pki.certificateToPem(cert),
            key : forge.pki.privateKeyToPem(keys.privateKey),
        }
    }
}
