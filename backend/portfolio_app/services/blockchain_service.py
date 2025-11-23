"""
Blockchain Service - Audit Trail
Simplified implementation for demo purposes
In production: integrate with Hyperledger Fabric or Ethereum
"""

import hashlib
import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
from ..extensions import db
from ..models.tbl_blockchain_audit import BlockchainAudit


class Block:
    """
    Block in the blockchain
    """
    
    def __init__(
        self,
        index: int,
        transactions: List[Dict],
        timestamp: float,
        previous_hash: str,
        nonce: int = 0
    ):
        self.index = index
        self.transactions = transactions
        self.timestamp = timestamp
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate SHA-256 hash of block"""
        block_string = json.dumps({
            'index': self.index,
            'transactions': self.transactions,
            'timestamp': self.timestamp,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }, sort_keys=True)
        
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty: int = 2):
        """
        Proof of Work - mine block with difficulty
        Simplified for demo (difficulty=2 means hash starts with "00")
        """
        target = '0' * difficulty
        
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
    
    def to_dict(self) -> Dict:
        """Convert block to dictionary"""
        return {
            'index': self.index,
            'transactions': self.transactions,
            'timestamp': self.timestamp,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'hash': self.hash
        }


class SimpleBlockchain:
    """
    Simplified blockchain for demo
    In production: use Hyperledger Fabric or Ethereum smart contracts
    """
    
    def __init__(self, difficulty: int = 2):
        """
        Initialize blockchain with genesis block
        
        Args:
            difficulty: Mining difficulty (number of leading zeros)
        """
        self.chain: List[Block] = []
        self.difficulty = difficulty
        self.pending_transactions: List[Dict] = []
        self.mining_reward = 0  # No mining reward for audit trail
        
        # Create genesis block
        self._create_genesis_block()
    
    def _create_genesis_block(self):
        """Create the first block in the chain"""
        genesis_block = Block(
            index=0,
            transactions=[{
                'type': 'genesis',
                'data': 'AI Governance Platform - Genesis Block',
                'timestamp': time.time()
            }],
            timestamp=time.time(),
            previous_hash='0'
        )
        genesis_block.mine_block(self.difficulty)
        self.chain.append(genesis_block)
    
    def get_latest_block(self) -> Block:
        """Get the most recent block"""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Dict) -> str:
        """
        Add transaction to pending transactions
        
        Args:
            transaction: Transaction data dictionary
        
        Returns:
            Transaction ID (hash)
        """
        # Add timestamp if not present
        if 'timestamp' not in transaction:
            transaction['timestamp'] = time.time()
        
        # Generate transaction ID
        tx_id = hashlib.sha256(
            json.dumps(transaction, sort_keys=True).encode()
        ).hexdigest()
        
        transaction['tx_id'] = tx_id
        self.pending_transactions.append(transaction)
        
        return tx_id
    
    def mine_pending_transactions(self) -> Optional[Block]:
        """
        Mine pending transactions into a new block
        
        Returns:
            The newly mined block or None if no pending transactions
        """
        if not self.pending_transactions:
            return None
        
        # Create new block
        block = Block(
            index=len(self.chain),
            transactions=self.pending_transactions.copy(),
            timestamp=time.time(),
            previous_hash=self.get_latest_block().hash
        )
        
        # Mine block (Proof of Work)
        block.mine_block(self.difficulty)
        
        # Add to chain
        self.chain.append(block)
        
        # Clear pending transactions
        self.pending_transactions = []
        
        return block
    
    def is_chain_valid(self) -> bool:
        """
        Validate the entire blockchain
        
        Returns:
            True if chain is valid, False otherwise
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Verify current block hash
            if current_block.hash != current_block.calculate_hash():
                return False
            
            # Verify previous hash link
            if current_block.previous_hash != previous_block.hash:
                return False
            
            # Verify Proof of Work
            if not current_block.hash.startswith('0' * self.difficulty):
                return False
        
        return True
    
    def get_block_by_hash(self, block_hash: str) -> Optional[Block]:
        """Get block by its hash"""
        for block in self.chain:
            if block.hash == block_hash:
                return block
        return None
    
    def get_transaction_by_id(self, tx_id: str) -> Optional[Dict]:
        """Get transaction by ID"""
        for block in self.chain:
            for tx in block.transactions:
                if tx.get('tx_id') == tx_id:
                    return {
                        'transaction': tx,
                        'block_index': block.index,
                        'block_hash': block.hash,
                        'confirmations': len(self.chain) - block.index
                    }
        return None


class BlockchainService:
    """
    Blockchain service for AI Governance Platform
    Handles logging decisions to blockchain and verification
    """
    
    def __init__(self):
        """Initialize blockchain service"""
        # In production: connect to actual blockchain network
        # For demo: use simple in-memory blockchain
        self.blockchain = SimpleBlockchain(difficulty=2)
    
    async def log_decision(self, event_data: Dict[str, Any]) -> str:
        """
        Log a decision to blockchain
        
        Args:
            event_data: Event data to log
        
        Returns:
            Transaction hash (blockchain TX hash)
        """
        # Hash sensitive data before logging
        if 'data' in event_data and event_data.get('is_sensitive'):
            event_data['data_hash'] = self._hash_data(event_data['data'])
            del event_data['data']  # Don't store sensitive data on-chain
        
        # Create transaction
        transaction = {
            'event_type': event_data.get('event_type'),
            'entity_id': event_data.get('entity_id'),
            'actor_id': event_data.get('actor_id'),
            'action': event_data.get('action'),
            'data_hash': event_data.get('data_hash', ''),
            'confidence': event_data.get('confidence_score', 0),
            'requires_approval': event_data.get('requires_approval', False),
            'is_sensitive': event_data.get('is_sensitive', False),
            'mpc_proof_hash': event_data.get('mpc_proof_hash', ''),
            'timestamp': event_data.get('timestamp', time.time())
        }
        
        # Add to blockchain
        tx_id = self.blockchain.add_transaction(transaction)
        
        # Mine block (in production, this would be async/scheduled)
        block = self.blockchain.mine_pending_transactions()
        
        if block:
            # Store in MySQL for fast queries
            await self._index_transaction(
                tx_hash=tx_id,
                event_data=event_data,
                block_number=block.index
            )
        
        return tx_id
    
    async def verify_decision(self, tx_hash: str) -> Dict[str, Any]:
        """
        Verify a decision by querying blockchain
        
        Args:
            tx_hash: Transaction hash to verify
        
        Returns:
            Verification result with proof
        """
        # Find transaction in blockchain
        tx_data = self.blockchain.get_transaction_by_id(tx_hash)
        
        if not tx_data:
            return {
                'valid': False,
                'error': 'Transaction not found'
            }
        
        # Verify blockchain integrity
        is_chain_valid = self.blockchain.is_chain_valid()
        
        return {
            'valid': is_chain_valid,
            'transaction': tx_data['transaction'],
            'block_index': tx_data['block_index'],
            'block_hash': tx_data['block_hash'],
            'confirmations': tx_data['confirmations'],
            'chain_valid': is_chain_valid
        }
    
    async def get_audit_trail(
        self,
        event_type: Optional[str] = None,
        actor_id: Optional[int] = None,
        start_time: Optional[float] = None,
        end_time: Optional[float] = None
    ) -> List[Dict]:
        """
        Get audit trail with optional filters
        
        Args:
            event_type: Filter by event type
            actor_id: Filter by actor ID
            start_time: Start timestamp
            end_time: End timestamp
        
        Returns:
            List of transactions matching filters
        """
        results = []
        
        for block in self.blockchain.chain[1:]:  # Skip genesis
            for tx in block.transactions:
                # Apply filters
                if event_type and tx.get('event_type') != event_type:
                    continue
                
                if actor_id and tx.get('actor_id') != actor_id:
                    continue
                
                if start_time and tx.get('timestamp', 0) < start_time:
                    continue
                
                if end_time and tx.get('timestamp', 0) > end_time:
                    continue
                
                results.append({
                    'transaction': tx,
                    'block_index': block.index,
                    'block_hash': block.hash,
                    'block_timestamp': block.timestamp
                })
        
        return results
    
    def get_blockchain_stats(self) -> Dict[str, Any]:
        """Get blockchain statistics"""
        total_blocks = len(self.blockchain.chain)
        total_transactions = sum(
            len(block.transactions) 
            for block in self.blockchain.chain
        )
        
        return {
            'total_blocks': total_blocks,
            'total_transactions': total_transactions,
            'chain_valid': self.blockchain.is_chain_valid(),
            'latest_block_hash': self.blockchain.get_latest_block().hash,
            'difficulty': self.blockchain.difficulty
        }
    
    def _hash_data(self, data: Any) -> str:
        """Create SHA-256 hash of data"""
        data_str = json.dumps(data, sort_keys=True) if isinstance(data, dict) else str(data)
        return hashlib.sha256(data_str.encode()).hexdigest()
    
    async def _index_transaction(
        self,
        tx_hash: str,
        event_data: Dict,
        block_number: int
    ):
        """
        Store transaction in MySQL for fast queries
        
        Args:
            tx_hash: Transaction hash
            event_data: Event data
            block_number: Block number in blockchain
        """
        audit_record = BlockchainAudit(
            event_type=event_data.get('event_type'),
            entity_id=event_data.get('entity_id'),
            actor_id=event_data.get('actor_id'),
            action=event_data.get('action'),
            data_hash=event_data.get('data_hash', ''),
            blockchain_tx_hash=tx_hash,
            block_number=block_number,
            timestamp=datetime.utcnow()
        )
        
        db.session.add(audit_record)
        db.session.commit()


# Global blockchain instance (in production: use proper singleton or DI)
_blockchain_service = None

def get_blockchain_service() -> BlockchainService:
    """Get global blockchain service instance"""
    global _blockchain_service
    if _blockchain_service is None:
        _blockchain_service = BlockchainService()
    return _blockchain_service


# Test function
def test_blockchain_service():
    """Test blockchain functionality"""
    service = BlockchainService()
    
    print("✅ Blockchain initialized")
    print(f"Genesis block hash: {service.blockchain.chain[0].hash[:16]}...")
    
    # Add test transaction
    tx_id = service.blockchain.add_transaction({
        'event_type': 'ai_task_execution',
        'actor_id': 1,
        'data': 'Test decision',
        'confidence': 0.85
    })
    
    print(f"\n✅ Transaction added: {tx_id[:16]}...")
    
    # Mine block
    block = service.blockchain.mine_pending_transactions()
    print(f"✅ Block mined: #{block.index} - {block.hash[:16]}...")
    
    # Verify
    is_valid = service.blockchain.is_chain_valid()
    print(f"\n✅ Blockchain valid: {is_valid}")
    
    # Get transaction
    tx_data = service.blockchain.get_transaction_by_id(tx_id)
    print(f"✅ Transaction found in block #{tx_data['block_index']}")
    print(f"   Confirmations: {tx_data['confirmations']}")
    
    # Stats
    stats = service.get_blockchain_stats()
    print(f"\n📊 Stats:")
    print(f"   Total blocks: {stats['total_blocks']}")
    print(f"   Total transactions: {stats['total_transactions']}")


if __name__ == '__main__':
    test_blockchain_service()

