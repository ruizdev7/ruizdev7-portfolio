from typing import Dict, Any, List, Optional
from flask import current_app
from openai import OpenAI
import json


class OpenAIService:
    """Service for OpenAI integration to generate insights from pump data"""

    @staticmethod
    def get_client() -> OpenAI:
        """Get OpenAI client instance"""
        api_key: Optional[str] = current_app.config.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not configured")
        return OpenAI(api_key=api_key)

    @staticmethod
    def generate_pump_insights(
        summary_data: Dict[str, Any],
        status_distribution: List[Dict[str, Any]],
        numeric_stats: Dict[str, Any],
        locations: List[Dict[str, Any]],
    ) -> str:
        """
        Generate AI insights from pump data analysis

        Args:
            summary_data: Overall summary statistics
            status_distribution: Distribution of pump statuses
            numeric_stats: Statistical metrics for numeric fields
            locations: Distribution by location

        Returns:
            AI-generated insights as a string
        """
        try:
            client = OpenAIService.get_client()

            # Prepare data summary for AI
            data_context = f"""
            Pump System Analysis Data:
            
            Total Pumps: {summary_data.get('total_pumps', 0)}
            
            Status Distribution:
            {json.dumps(status_distribution, indent=2)}
            
            Metrics:
            - Operational Efficiency: {summary_data.get('metrics', {}).get('operational_efficiency_pct', 0):.1f}%
            - Maintenance Pumps: {summary_data.get('metrics', {}).get('maintenance_pct', 0):.1f}%
            - System Availability: {summary_data.get('metrics', {}).get('system_availability_pct', 0):.1f}%
            
            Top Locations:
            {json.dumps(locations[:5], indent=2) if locations else 'No location data'}
            """

            prompt = f"""
            You are an industrial pump system analyst. Based on the following data from a pump monitoring system, provide 3-5 key insights in a professional, concise manner. Focus on:
            
            1. Overall system health and operational status
            2. Potential issues or areas of concern
            3. Maintenance recommendations if applicable
            4. Notable patterns or trends
            
            Format the response as a bulleted list in English. Be specific and actionable.
            
            {data_context}
            """

            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Using mini for cost efficiency
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert industrial equipment analyst specializing in pump systems and maintenance optimization.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=500,
            )

            return response.choices[0].message.content.strip()

        except ValueError:
            return "AI insights unavailable: OpenAI API key not configured"
        except Exception as e:
            print(f"Error generating AI insights: {str(e)}")
            return f"Unable to generate insights: {str(e)}"

    @staticmethod
    def generate_chart_insight(
        chart_type: str,
        chart_data: List[Dict[str, Any]],
        chart_title: str,
    ) -> str:
        """
        Generate AI insights for a specific chart

        Args:
            chart_type: Type of chart (e.g., 'column', 'pie', 'scatter')
            chart_data: Data used in the chart
            chart_title: Title of the chart

        Returns:
            AI-generated insight for the specific chart
        """
        try:
            client = OpenAIService.get_client()

            data_summary = json.dumps(chart_data, indent=2) if chart_data else "No data"

            prompt = f"""
            Analyze the following {chart_type} chart data titled "{chart_title}" and provide 1-2 key insights in a single sentence. Be concise and specific.
            
            Chart Data:
            {data_summary}
            
            Insight:"""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a data visualization expert providing concise chart insights.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=150,
            )

            return response.choices[0].message.content.strip()

        except ValueError:
            return "AI insight unavailable: OpenAI API key not configured"
        except Exception as e:
            error_message = str(e).lower()
            if "insufficient_quota" in error_message or "quota" in error_message:
                return "AI insight unavailable: No credits available in OpenAI account."
            elif "429" in error_message or "rate limit" in error_message:
                return "AI insight temporarily unavailable: Rate limit exceeded."
            else:
                print(f"Error generating chart insight: {str(e)}")
                return "Unable to generate insight"
