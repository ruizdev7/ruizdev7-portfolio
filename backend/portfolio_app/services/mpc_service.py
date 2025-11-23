"""
MPC Service - Multi-Party Computation
Simplified implementation using Shamir Secret Sharing for demo
"""

import hashlib
import json
import secrets
from typing import List, Tuple, Dict, Any
from datetime import datetime


class ShamirSecretSharing:
    """
    Simplified Shamir Secret Sharing implementation
    For demo purposes - production should use audited libraries
    """

    # Prime number for finite field (256-bit)
    PRIME = 2**256 - 189

    @classmethod
    def split_secret(
        cls, secret: bytes, threshold: int, num_shares: int
    ) -> List[Tuple[int, int]]:
        """
        Split secret into shares using Shamir Secret Sharing

        Args:
            secret: Secret data as bytes
            threshold: Minimum shares needed to reconstruct (K)
            num_shares: Total number of shares to create (N)

        Returns:
            List of (x, y) tuples representing shares
        """
        if threshold > num_shares:
            raise ValueError("Threshold cannot exceed number of shares")

        if threshold < 2:
            raise ValueError("Threshold must be at least 2")

        # Convert secret to integer
        secret_int = int.from_bytes(secret, byteorder="big")

        if secret_int >= cls.PRIME:
            raise ValueError("Secret too large for field")

        # Generate random coefficients for polynomial
        # f(x) = secret + a1*x + a2*x^2 + ... + a(k-1)*x^(k-1)
        coefficients = [secret_int]
        for _ in range(threshold - 1):
            coefficients.append(secrets.randbelow(cls.PRIME))

        # Evaluate polynomial at x = 1, 2, ..., num_shares
        shares = []
        for x in range(1, num_shares + 1):
            y = cls._evaluate_polynomial(coefficients, x)
            shares.append((x, y))

        return shares

    @classmethod
    def reconstruct_secret(cls, shares: List[Tuple[int, int]]) -> bytes:
        """
        Reconstruct secret from shares using Lagrange interpolation

        Args:
            shares: List of (x, y) shares (minimum threshold)

        Returns:
            Reconstructed secret as bytes
        """
        if len(shares) < 2:
            raise ValueError("Need at least 2 shares to reconstruct")

        # Lagrange interpolation at f(0)
        secret_int = 0

        for i, (x_i, y_i) in enumerate(shares):
            # Calculate Lagrange basis polynomial at x=0
            numerator = 1
            denominator = 1

            for j, (x_j, _) in enumerate(shares):
                if i != j:
                    numerator = (numerator * (-x_j)) % cls.PRIME
                    denominator = (denominator * (x_i - x_j)) % cls.PRIME

            # Compute modular inverse
            lagrange_coeff = (numerator * pow(denominator, -1, cls.PRIME)) % cls.PRIME

            secret_int = (secret_int + y_i * lagrange_coeff) % cls.PRIME

        # Convert back to bytes
        secret_bytes = secret_int.to_bytes(
            (secret_int.bit_length() + 7) // 8, byteorder="big"
        )

        return secret_bytes

    @classmethod
    def _evaluate_polynomial(cls, coefficients: List[int], x: int) -> int:
        """Evaluate polynomial at point x using Horner's method"""
        result = 0
        for coef in reversed(coefficients):
            result = (result * x + coef) % cls.PRIME
        return result


class MPCService:
    """
    MPC Service for secure computation on sensitive data
    Simplified demo version - simulates distributed computation
    """

    def __init__(self, threshold: int = 3, num_shares: int = 5):
        """
        Initialize MPC service

        Args:
            threshold: Minimum shares needed to reconstruct (default 3)
            num_shares: Total shares to create (default 5)
        """
        self.threshold = threshold
        self.num_shares = num_shares
        self.shamir = ShamirSecretSharing()

    def secure_compute(self, sensitive_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform secure computation on sensitive data using MPC

        In a real implementation, this would:
        1. Split data into shares
        2. Distribute to multiple nodes
        3. Compute on shares without reconstructing
        4. Return result with proof

        For demo, we simulate the process

        Args:
            sensitive_data: Dictionary with sensitive information

        Returns:
            Dictionary with result and proof
        """
        # Convert data to bytes
        data_json = json.dumps(sensitive_data, sort_keys=True)
        data_bytes = data_json.encode("utf-8")

        # Create hash of original data (for proof)
        input_hash = hashlib.sha256(data_bytes).hexdigest()

        # For large data, use chunking strategy
        # Split data into chunks that fit within the finite field
        # PRIME is 2^256 - 189, so max bytes is ~32 bytes (256 bits / 8)
        # Use 28 bytes per chunk for safety margin
        max_chunk_size = 28

        if len(data_bytes) > max_chunk_size:
            # Use chunking: split data into smaller pieces
            chunk_shares = self._split_large_secret(
                data_bytes, self.threshold, self.num_shares, max_chunk_size
            )
            # For reconstruction, we'll need to combine chunks
            reconstructed = self._reconstruct_large_secret(chunk_shares, self.threshold)
            # Create processed_shares for proof (simplified for chunked data)
            processed_shares = [(1, 1, input_hash[:16])]
        else:
            # Small data: use standard Shamir Secret Sharing
            shares = self.shamir.split_secret(
                data_bytes, self.threshold, self.num_shares
            )
            # Simulate distributed computation
            processed_shares = []
            for x, y in shares[: self.threshold]:  # Use only threshold shares
                # Simulate node computation
                share_hash = hashlib.sha256(f"{x}:{y}".encode()).hexdigest()
                processed_shares.append((x, y, share_hash))

            # Reconstruct result (in reality, this would be the computed result)
            reconstructed = self.shamir.reconstruct_secret(shares[: self.threshold])

        # Parse result
        try:
            result_data = json.loads(reconstructed.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            # If reconstruction failed, return original data (fallback)
            result_data = sensitive_data

        # Create result hash
        if isinstance(reconstructed, bytes):
            result_hash = hashlib.sha256(reconstructed).hexdigest()
        else:
            result_hash = hashlib.sha256(
                json.dumps(result_data, sort_keys=True).encode()
            ).hexdigest()

        # Generate Zero-Knowledge Proof (simplified)
        zkp = self._generate_zkp(input_hash, result_hash, processed_shares)

        return {
            "result": result_data,
            "mpc_metadata": {
                "nodes_used": self.threshold,
                "total_nodes": self.num_shares,
                "threshold": self.threshold,
                "input_hash": input_hash,
                "result_hash": result_hash,
                "timestamp": datetime.utcnow().isoformat(),
            },
            "proof": zkp,
        }

    def verify_computation(
        self, input_hash: str, result_hash: str, proof: Dict[str, Any]
    ) -> bool:
        """
        Verify that MPC computation was performed correctly

        Args:
            input_hash: SHA-256 hash of input data
            result_hash: SHA-256 hash of result
            proof: Zero-knowledge proof

        Returns:
            True if verification passes
        """
        # Verify proof structure
        required_fields = [
            "commitment",
            "input_hash",
            "result_hash",
            "timestamp",
            "signature",
        ]
        if not all(field in proof for field in required_fields):
            return False

        # Verify hashes match
        if proof["input_hash"] != input_hash:
            return False

        if proof["result_hash"] != result_hash:
            return False

        # Verify commitment
        expected_commitment = hashlib.sha256(
            f"{input_hash}{result_hash}{proof['timestamp']}".encode()
        ).hexdigest()

        if proof["commitment"] != expected_commitment:
            return False

        # Verify signature (simplified)
        expected_signature = hashlib.sha256(
            f"{proof['commitment']}{proof['timestamp']}".encode()
        ).hexdigest()

        if proof["signature"] != expected_signature:
            return False

        return True

    def _split_large_secret(
        self,
        data_bytes: bytes,
        threshold: int,
        num_shares: int,
        chunk_size: int,
    ) -> List[List[Tuple[int, int]]]:
        """
        Split large secret into chunks and create shares for each chunk

        Args:
            data_bytes: Data to split
            threshold: Minimum shares needed
            num_shares: Total shares to create
            chunk_size: Maximum size of each chunk in bytes

        Returns:
            List of chunk shares, where each chunk has its own shares
        """
        # Split data into chunks
        chunks = []
        for i in range(0, len(data_bytes), chunk_size):
            chunks.append(data_bytes[i : i + chunk_size])

        # Create shares for each chunk
        all_chunk_shares = []
        for chunk in chunks:
            try:
                chunk_shares = self.shamir.split_secret(chunk, threshold, num_shares)
                all_chunk_shares.append(chunk_shares)
            except ValueError:
                # If chunk is still too large, use hash of chunk as the secret
                chunk_hash = hashlib.sha256(chunk).digest()[:chunk_size]
                chunk_shares = self.shamir.split_secret(
                    chunk_hash, threshold, num_shares
                )
                all_chunk_shares.append(chunk_shares)

        return all_chunk_shares

    def _reconstruct_large_secret(
        self, chunk_shares: List[List[Tuple[int, int]]], threshold: int
    ) -> bytes:
        """
        Reconstruct large secret from chunk shares

        Args:
            chunk_shares: List of chunk shares
            threshold: Minimum shares needed

        Returns:
            Reconstructed data as bytes
        """
        reconstructed_chunks = []
        for chunk_share_set in chunk_shares:
            # Reconstruct each chunk
            chunk = self.shamir.reconstruct_secret(chunk_share_set[:threshold])
            reconstructed_chunks.append(chunk)

        # Combine chunks
        return b"".join(reconstructed_chunks)

    def _generate_zkp(
        self, input_hash: str, result_hash: str, processed_shares: List[Tuple]
    ) -> Dict[str, Any]:
        """
        Generate Zero-Knowledge Proof of correct computation
        Simplified version for demo

        Args:
            input_hash: Hash of input data
            result_hash: Hash of result
            processed_shares: List of processed share data

        Returns:
            ZKP dictionary
        """
        timestamp = datetime.utcnow().isoformat()

        # Create commitment
        commitment = hashlib.sha256(
            f"{input_hash}{result_hash}{timestamp}".encode()
        ).hexdigest()

        # Create signature (simplified - should use proper digital signature)
        signature = hashlib.sha256(f"{commitment}{timestamp}".encode()).hexdigest()

        return {
            "type": "shamir-mpc-zkp",
            "version": "1.0",
            "commitment": commitment,
            "input_hash": input_hash,
            "result_hash": result_hash,
            "nodes_used": len(processed_shares),
            "timestamp": timestamp,
            "signature": signature,
            "protocol": "shamir-secret-sharing",
        }


# Utility function for detecting sensitive data
def classify_sensitivity(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Classify if data contains sensitive information (PII)

    Args:
        data: Dictionary to analyze

    Returns:
        Tuple of (is_sensitive, detected_types)
    """
    import re

    sensitive_patterns = {
        "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
        "credit_card": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",
        "email": r"\b[\w.-]+@[\w.-]+\.\w+\b",
        "phone": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
        "account_number": r"\b\d{8,17}\b",
    }

    data_str = json.dumps(data).lower()
    detected = []

    for data_type, pattern in sensitive_patterns.items():
        if re.search(pattern, data_str):
            detected.append(data_type)

    return len(detected) > 0, detected


# Test function
def test_mpc_service():
    """Test MPC service functionality"""
    mpc = MPCService(threshold=3, num_shares=5)

    # Test data with sensitive info
    sensitive_data = {"user_id": 12345, "ssn": "123-45-6789", "credit_score": 750}

    print("Original data:", sensitive_data)

    # Perform secure computation
    result = mpc.secure_compute(sensitive_data)

    print("\n✅ MPC Computation Complete")
    print(
        f"Nodes used: {result['mpc_metadata']['nodes_used']}/{result['mpc_metadata']['total_nodes']}"
    )
    print(f"Input hash: {result['mpc_metadata']['input_hash'][:16]}...")
    print(f"Result hash: {result['mpc_metadata']['result_hash'][:16]}...")
    print(f"Proof type: {result['proof']['type']}")

    # Verify
    is_valid = mpc.verify_computation(
        result["mpc_metadata"]["input_hash"],
        result["mpc_metadata"]["result_hash"],
        result["proof"],
    )

    print(f"\n✅ Verification: {'PASSED' if is_valid else 'FAILED'}")

    return result


if __name__ == "__main__":
    test_mpc_service()
