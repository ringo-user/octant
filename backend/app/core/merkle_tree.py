from typing import List

from multiproof import StandardMerkleTree

from app import database
from app.core.common import AccountFunds
from app.exceptions import MissingAddress

LEAF_ENCODING: List[str] = ["address", "uint256"]


def get_proof_by_address_and_epoch(address: str, epoch: int) -> List[str]:
    merkle_tree = get_merkle_tree_for_epoch(epoch)
    return get_proof(merkle_tree, address)


def get_merkle_tree_for_epoch(epoch: int) -> StandardMerkleTree:
    leaves = [
        AccountFunds(r.address, int(r.amount))
        for r in database.rewards.get_by_epoch(epoch)
    ]
    return build_merkle_tree(leaves)


def build_merkle_tree(leaves: List[AccountFunds]) -> StandardMerkleTree:
    return StandardMerkleTree.of(
        [[leaf.address, leaf.amount] for leaf in leaves], LEAF_ENCODING
    )


def get_proof(mt: StandardMerkleTree, address: str) -> List[str]:
    for i, leaf in enumerate(mt.values):
        if leaf.value[0] == address:
            return mt.get_proof(i)
    raise MissingAddress(address)
