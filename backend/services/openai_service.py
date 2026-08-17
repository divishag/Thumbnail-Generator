import base64
from openai import AsyncOpenAI
from config import OPENAI_API_KEY

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def generate_thumbnail(prompt:str,style_prompt:str, headshot_url:str)->bytes:
    """
    Use the Responses API with gpt-image-2 as a built in image-generation
    tool.
    Pass the headshot URL directly as an input_image.
    Returns raw PNG bytes
    """
    full_prompt=(
        f"{style_prompt}\n\n"
        f"User request: {prompt}\n\n"
        "IMPORTANT: The generated thumbnail MUST prominently feature the person"
        "shown in the provided headshot image. Keep their likeness accurate"
        
    )
    response=await client.responses.create(
             model="gpt-4o ",
             input=[
                    {
                        "role":"user",
                            "content":[
                                {
                                    "type":"text",
                                    "text":full_prompt
                                },
                                {
                                    "type":"input_image",
                                    "image_url":headshot_url
                                }
                            ]
                    }
             ], 
            tools=[
                    {
                    "type":"image_generation",
                    "model":"gpt-image-2",
                    "size":"1536x1024",
                    "quality":"medium",
                    "output_format":"png",
                    }, 
                ],
    )
    for item in response.output:
        if item.type=="image_generation_call" and item.result:
            return base64.b64decode(item.result)
    raise RuntimeError("No image generation result found in the response")
    
     