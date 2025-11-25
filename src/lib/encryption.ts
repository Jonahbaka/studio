/**
 * Encryption utilities for HIPAA-compliant data handling
 * Uses Web Crypto API for client-side encryption
 */

/**
 * Generate a random encryption key
 * @returns CryptoKey for AES-GCM encryption
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Export a CryptoKey to base64 string for storage
 * @param key - CryptoKey to export
 * @returns Base64 encoded key
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import a key from base64 string
 * @param keyData - Base64 encoded key
 * @returns CryptoKey
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
    const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        'raw',
        binaryKey,
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt data using AES-GCM
 * @param data - Data to encrypt
 * @param key - Encryption key
 * @returns Encrypted data with IV (base64 encoded)
 */
export async function encryptData(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using AES-GCM
 * @param encryptedData - Base64 encoded encrypted data with IV
 * @param key - Decryption key
 * @returns Decrypted string
 */
export async function decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        encrypted
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

/**
 * Hash data using SHA-256 (for integrity checks)
 * @param data - Data to hash
 * @returns Hex encoded hash
 */
export async function hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitize PHI data for logging (redact sensitive fields)
 * @param data - Object containing PHI
 * @param fieldsToRedact - Array of field names to redact
 * @returns Sanitized object
 */
export function sanitizePHI<T extends Record<string, any>>(
    data: T,
    fieldsToRedact: string[] = ['ssn', 'dob', 'phoneNumber', 'address', 'email']
): T {
    const sanitized = { ...data };

    fieldsToRedact.forEach((field) => {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
}

/**
 * Validate if data contains PHI that requires encryption
 * @param content - Message content or data
 * @returns true if PHI detected
 */
export function containsPHI(content: string): boolean {
    // Basic pattern matching for common PHI
    const phiPatterns = [
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN
        /\b\d{10}\b/, // Phone number (simple)
        /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, // Date of birth
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
    ];

    return phiPatterns.some((pattern) => pattern.test(content));
}

/**
 * Generate audit log entry for PHI access
 * @param userId - User accessing the data
 * @param action - Action performed
 * @param resourceType - Type of resource accessed
 * @param resourceId - ID of resource
 * @returns Audit log entry
 */
export interface AuditLogEntry {
    timestamp: Date;
    userId: string;
    action: 'read' | 'write' | 'delete' | 'share';
    resourceType: 'message' | 'medical_record' | 'appointment' | 'user_profile';
    resourceId: string;
    ipAddress?: string;
    userAgent?: string;
}

export function createAuditLog(
    userId: string,
    action: AuditLogEntry['action'],
    resourceType: AuditLogEntry['resourceType'],
    resourceId: string
): AuditLogEntry {
    return {
        timestamp: new Date(),
        userId,
        action,
        resourceType,
        resourceId,
        ipAddress: typeof window !== 'undefined' ? window.location.hostname : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
}
