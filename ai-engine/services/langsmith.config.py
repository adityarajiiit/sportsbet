import sys
import os
sys.path.insert(0,os.path.abspath('..'))
import config.settings as settings
import logging
logger=logging.getLogger(__name__)
def setupLangsmith():
        if settings.LANGCHAIN_API_KEY:
            os.environ["LANGCHAIN_TRACING_V2"]=str(settings.LANGCHAIN_TRACING_V2).lower()
            os.environ["LANGCHAIN_API_KEY"]=settings.LANGCHAIN_API_KEY
            os.environ["LANGCHAIN_PROJECT"]=settings.LANGCHAIN_PROJECT
            logger.info(f"langsmith working")
        else:
            os.environ["LANGCHAIN_TRACING_V2"]="false"
            logger.info(f"langsmith not working")
