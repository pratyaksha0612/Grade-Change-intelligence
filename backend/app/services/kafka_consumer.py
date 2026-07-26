import json
import logging
import asyncio
from typing import Callable, Any, Optional
from confluent_kafka import Consumer, KafkaError, KafkaException
from app.core.config import settings

logger = logging.getLogger(__name__)

class KafkaConsumerClient:
    def __init__(self, group_id: str, auto_offset_reset: str = 'latest'):
        self.group_id = group_id
        self.auto_offset_reset = auto_offset_reset
        self.consumer: Optional[Consumer] = None
        self._running = False

    def _initialize_consumer(self):
        try:
            conf = {
                'bootstrap.servers': settings.KAFKA_BROKER_URL,
                'group.id': self.group_id,
                'auto.offset.reset': self.auto_offset_reset,
                'enable.auto.commit': False,
                'session.timeout.ms': 10000,
            }
            self.consumer = Consumer(conf)
            logger.info(f"Kafka Consumer initialized for group {self.group_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Kafka Consumer: {str(e)}")
            self.consumer = None

    async def consume_loop(self, topics: list[str], callback: Callable[[dict], Any]):
        """
        Asynchronously consume messages from topics and process them using the provided callback.
        """
        if not self.consumer:
            self._initialize_consumer()
            
        if not self.consumer:
            logger.error("Consumer is not initialized. Exiting consume loop.")
            return

        try:
            self.consumer.subscribe(topics)
            self._running = True
            logger.info(f"Subscribed to topics: {topics}")

            while self._running:
                # Use to_thread to prevent blocking the main asyncio event loop
                msg = await asyncio.to_thread(self.consumer.poll, 0.1)
                
                if msg is None:
                    # Small sleep to prevent tight loop if polling returns immediately
                    await asyncio.sleep(0.01)
                    continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        # End of partition event
                        continue
                    else:
                        raise KafkaException(msg.error())
                
                # Process message
                try:
                    val = msg.value().decode('utf-8')
                    payload = json.loads(val)
                    
                    # Execute callback. If callback is async, await it.
                    if asyncio.iscoroutinefunction(callback):
                        await callback(payload)
                    else:
                        callback(payload)
                        
                    # Commit offset manually after successful processing
                    self.consumer.commit(asynchronous=True)
                except json.JSONDecodeError:
                    logger.error("Failed to decode Kafka message payload as JSON.")
                except Exception as e:
                    logger.error(f"Error processing Kafka message: {str(e)}")

        except Exception as e:
            logger.error(f"Kafka consumer loop error: {str(e)}")
        finally:
            self.stop()

    def stop(self):
        self._running = False
        if self.consumer:
            self.consumer.close()
            logger.info("Kafka Consumer closed.")
