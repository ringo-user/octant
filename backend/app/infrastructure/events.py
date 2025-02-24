import json
from typing import List

from flask import current_app as app
from flask_socketio import emit

from app.engine.projects.rewards import ProjectRewardDTO
from app.exceptions import OctantException
from app.extensions import socketio, epochs
from app.infrastructure.exception_handler import UNEXPECTED_EXCEPTION, ExceptionHandler
from app.legacy.controllers import allocations
from app.legacy.controllers.allocations import allocate
from app.legacy.controllers.rewards import (
    get_allocation_threshold,
)
from app.legacy.core.allocations import AllocationRequest
from app.legacy.core.common import AccountFunds
from app.modules.project_rewards.controller import get_estimated_project_rewards


@socketio.on("connect")
def handle_connect():
    app.logger.debug("Client connected")

    if epochs.get_pending_epoch() is not None:
        threshold = get_allocation_threshold()
        emit("threshold", {"threshold": str(threshold)})

        project_rewards = get_estimated_project_rewards().rewards
        emit("proposal_rewards", _serialize_project_rewards(project_rewards))


@socketio.on("disconnect")
def handle_disconnect():
    app.logger.debug("Client disconnected")


@socketio.on("allocate")
def handle_allocate(msg):
    msg = json.loads(msg)
    payload, signature = msg["payload"], msg["signature"]
    is_manually_edited = msg["isManuallyEdited"] if "isManuallyEdited" in msg else None
    app.logger.info(f"User allocation payload: {payload}, signature: {signature}")
    user_address = allocate(
        AllocationRequest(payload, signature, override_existing_allocations=True),
        is_manually_edited,
    )
    app.logger.info(f"User: {user_address} allocated successfully")

    threshold = get_allocation_threshold()
    emit("threshold", {"threshold": str(threshold)}, broadcast=True)
    allocations_sum = allocations.get_sum_by_epoch()
    emit("allocations_sum", {"amount": str(allocations_sum)}, broadcast=True)

    project_rewards = get_estimated_project_rewards().rewards
    emit(
        "proposal_rewards",
        _serialize_project_rewards(project_rewards),
        broadcast=True,
    )
    for proposal in project_rewards:
        donors = allocations.get_all_by_proposal_and_epoch(proposal.address)
        emit(
            "proposal_donors",
            {"proposal": proposal.address, "donors": _serialize_donors(donors)},
            broadcast=True,
        )


@socketio.on("proposal_donors")
def handle_proposal_donors(proposal_address: str):
    donors = allocations.get_all_by_proposal_and_epoch(proposal_address)
    emit(
        "proposal_donors",
        {"proposal": proposal_address, "donors": _serialize_donors(donors)},
    )


@socketio.on_error_default
def default_error_handler(e):
    ExceptionHandler.print_stacktrace(e)
    if isinstance(e, OctantException):
        emit("exception", {"message": str(e.message)})
    else:
        emit("exception", {"message": UNEXPECTED_EXCEPTION})


def _serialize_project_rewards(project_rewards: List[ProjectRewardDTO]) -> List[dict]:
    return [
        {
            "address": project_reward.address,
            "allocated": str(project_reward.allocated),
            "matched": str(project_reward.matched),
        }
        for project_reward in project_rewards
    ]


def _serialize_donors(donors: List[AccountFunds]) -> List[dict]:
    return [
        {
            "address": donor.address,
            "amount": str(donor.amount),
        }
        for donor in donors
    ]
