"""
Base Agent Class - All agents inherit from this
Implements common functionality for multi-agent system
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import logging
from ..services.sarvam_service import SarvamService

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """
    Base class for all AI agents in EduVoice system
    """
    
    def __init__(self, agent_name: str, agent_type: str):
        self.agent_id = str(uuid.uuid4())
        self.agent_name = agent_name
        self.agent_type = agent_type
        self.sarvam = SarvamService()
        self.state: Dict[str, Any] = {}
        self.created_at = datetime.now()
        self.last_active = datetime.now()
    
    @abstractmethod
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute agent's primary function
        Must be implemented by each agent
        """
        pass
    
    async def validate_input(self, task: Dict[str, Any]) -> bool:
        """Validate input before execution"""
        if not task.get("user_id"):
            logger.error(f"Agent {self.agent_name}: Missing user_id")
            return False
        if not task.get("action"):
            logger.error(f"Agent {self.agent_name}: Missing action")
            return False
        return True
    
    async def log_execution(self, task: Dict[str, Any], result: Dict[str, Any]):
        """Log agent execution for analytics and compliance"""
        log_entry = {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "user_id": task.get("user_id"),
            "action": task.get("action"),
            "timestamp": datetime.now().isoformat(),
            "success": result.get("success", False),
            "latency_ms": result.get("latency_ms", 0)
        }
        
        logger.info(f"Agent {self.agent_name} executed: {log_entry}")
    
    async def get_state(self) -> Dict[str, Any]:
        """Get current agent state"""
        return self.state
    
    async def set_state(self, key: str, value: Any):
        """Update agent state"""
        self.state[key] = value
        self.last_active = datetime.now()
    
    async def clear_state(self):
        """Reset agent state"""
        self.state = {}
        self.last_active = datetime.now()
    
    async def health_check(self) -> Dict[str, Any]:
        """Agent health status"""
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "status": "healthy",
            "last_active": self.last_active.isoformat(),
            "state_size": len(self.state)
        }
