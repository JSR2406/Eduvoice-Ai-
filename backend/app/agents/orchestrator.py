"""
Multi-Agent Orchestrator
Central hub for task routing, state management, and coordination
"""

from typing import Dict, Any, List
from datetime import datetime
import asyncio
import logging
from .base_agent import BaseAgent
from .voice_content_agent import VoiceContentAgent

logger = logging.getLogger(__name__)

class MultiAgentOrchestrator:
    """
    Central orchestrator for all EduVoice AI agents
    - Routes tasks to appropriate agents
    """
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.task_queue = asyncio.Queue()
        self.state_store: Dict[str, Any] = {}
        self.is_running = False
        
        # Initialize all agents
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Register all agents in the system"""
        self.agents["voice_content"] = VoiceContentAgent()
        
        logger.info(f"Initialized {len(self.agents)} agents")
    
    async def route_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route task to appropriate agent(s)
        """
        start_time = datetime.now()
        
        try:
            # 1. Validate task
            if not self._validate_task(task):
                return {
                    "success": False,
                    "error": "Invalid task structure",
                    "latency_ms": 0
                }
            
            # 2. Determine target agent(s)
            target_agents = self._determine_agents(task)
            
            if not target_agents:
                return {
                    "success": False,
                    "error": f"No agent found for task type: {task.get('type')}",
                    "latency_ms": 0
                }
            
            # 3. Execute task(s)
            results = []
            for agent_name in target_agents:
                agent = self.agents.get(agent_name)
                if not agent:
                    continue
                
                logger.info(f"Orchestrator routing to agent: {agent_name}")
                result = await agent.execute(task)
                results.append({
                    "agent": agent_name,
                    "result": result
                })
                
                if task.get("execution_mode") == "sequential":
                    await asyncio.sleep(0.1)
            
            # 4. Aggregate results
            end_time = datetime.now()
            latency_ms = (end_time - start_time).total_seconds() * 1000
            
            return {
                "success": True,
                "results": results,
                "agents_used": target_agents,
                "latency_ms": latency_ms,
                "timestamp": end_time.isoformat()
            }
        
        except Exception as e:
            logger.error(f"Orchestrator error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "latency_ms": 0
            }
    
    def _validate_task(self, task: Dict[str, Any]) -> bool:
        """Validate task structure"""
        required_fields = ["user_id", "type", "action"]
        return all(field in task for field in required_fields)
    
    def _determine_agents(self, task: Dict[str, Any]) -> List[str]:
        """
        Determine which agent(s) should handle this task
        """
        task_type = task.get("type", "")
        action = task.get("action", "")
        
        # Task routing rules
        routing_map = {
            "voice_generation": ["voice_content"],
        }
        
        # Find matching agents
        for key, agents in routing_map.items():
            if key in task_type or key in action:
                return agents
        
        # Default to voice_content agent
        return ["voice_content"]
    
    async def get_all_agents_health(self) -> Dict[str, Any]:
        """Get health status of all agents"""
        health_status = {}
        for agent_name, agent in self.agents.items():
            health_status[agent_name] = await agent.health_check()
        
        return {
            "total_agents": len(self.agents),
            "healthy_agents": sum(1 for h in health_status.values() if h["status"] == "healthy"),
            "agents": health_status,
            "timestamp": datetime.now().isoformat()
        }
    
    async def shutdown(self):
        """Gracefully shutdown all agents"""
        logger.info("Shutting down orchestrator...")
        self.is_running = False
        
        for agent in self.agents.values():
            await agent.clear_state()
        
        logger.info("All agents shut down")
