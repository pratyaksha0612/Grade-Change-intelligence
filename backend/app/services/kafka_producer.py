import json
import logging
from typing import Any, Dict
from confluent_kafka import Producer
from app.core.config import settings

logger = logging.getLogger(__name__)

class KafkaProducerClient:
    def __init__(self):
        self.producer = None
        self._initialize_producer()

    def _initialize_producer(self):
        try:
            conf = {
                'bootstrap.servers': settings.KAFKA_BROKER_URL,
                'client.id': 'gci-m1-ingestion-producer',
                'message.max.bytes': 10485760, # 10MB
                'linger.ms': 5, # Slight delay to allow batching
                'compression.type': 'lz4',
            }
            self.producer = Producer(conf)
            logger.info(f"Kafka Producer initialized for brokers: {settings.KAFKA_BROKER_URL}")
        except Exception as e:
            logger.error(f"Failed to initialize Kafka Producer: {str(e)}")
            self.producer = None

    def delivery_report(self, err, msg):
        """ Called once for each message produced to indicate delivery result """
        if err is not None:
            logger.error(f"Message delivery failed: {err}")
        else:
            logger.debug(f"Message delivered to {msg.topic()} [{msg.partition()}]")

    def publish_message(self, topic: str, key: str, message: Dict[str, Any]):
        """Publish a structured JSON message to a Kafka topic."""
        if not self.producer:
            logger.warning("Kafka Producer is not initialized. Message dropped.")
            return

        try:
            value = json.dumps(message).encode('utf-8')
            self.producer.produce(
                topic=topic,
                key=key.encode('utf-8') if key else None,
                value=value,
                callback=self.delivery_report
            )
            # Trigger delivery callbacks but don't block
            self.producer.poll(0)
        except BufferError:
            logger.error("Kafka Producer queue is full. Polling to free space...")
            self.producer.poll(1)
            self.publish_message(topic, key, message)
        except Exception as e:
            logger.error(f"Error publishing message to Kafka: {str(e)}")

    def flush(self):
        if self.producer:
            self.producer.flush()

# Singleton instance
kafka_producer = KafkaProducerClient()
