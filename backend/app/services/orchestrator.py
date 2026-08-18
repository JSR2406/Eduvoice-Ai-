import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services import gemini_service

logger = logging.getLogger(__name__)

class OrchestratorResponse(BaseModel):
    agent_used: str
    result: str
    status: str
    error: Optional[str] = None

class OrchestratorAgent:
    """
    The Orchestrator Agent routes incoming requests to the appropriate specialized agent.
    It demonstrates a multi-agent workflow for the IBM SkillsBuild submission.
    """
    
    def __init__(self):
        # Map action types to their specialized agent functions
        self.agents = {
            "summarize": gemini_service.summarize,
            "translate": gemini_service.translate,
            "rewrite": gemini_service.rewrite_for_grade,
            "homework": gemini_service.generate_homework,
            "announcement": gemini_service.generate_announcement,
            "revision": gemini_service.generate_revision,
            "reading": gemini_service.generate_reading,
            "assembly": gemini_service.generate_assembly,
        }

    async def process_content(self, action: str, payload: Dict[str, Any]) -> OrchestratorResponse:
        logger.info(f"Orchestrator Agent routing action '{action}' with payload keys: {list(payload.keys())}")
        
        if action not in self.agents:
            error_msg = f"Unknown action: {action}. Available agents: {list(self.agents.keys())}"
            logger.error(error_msg)
            return OrchestratorResponse(
                agent_used="orchestrator",
                result="",
                status="error",
                error=error_msg
            )
            
        agent_func = self.agents[action]
        try:
            # Route to specialized agent
            logger.info(f"Delegating to specialized agent for '{action}'")
            if action == "translate":
                result = await agent_func(payload.get("text", ""), payload.get("target_language", "hi"))
            elif action == "rewrite":
                result = await agent_func(payload.get("text", ""), payload.get("grade", "5th Grade"))
            elif action in ["homework", "announcement", "revision", "reading", "assembly"]:
                result = await agent_func(payload.get("topic", ""))
            elif action == "summarize":
                result = await agent_func(payload.get("text", ""))
            else:
                result = await agent_func(**payload)
                
            logger.info(f"Specialized agent for '{action}' completed successfully")
            return OrchestratorResponse(
                agent_used=action,
                result=result,
                status="success"
            )
        except Exception as e:
            logger.error(f"Error in specialized agent for '{action}': {str(e)}")
            return OrchestratorResponse(
                agent_used=action,
                result="",
                status="error",
                error=str(e)
            )

orchestrator_agent = OrchestratorAgent()
