# AI-Powered Property Description Generator

## Overview

The `generateAiDescription` function creates personalized, AI-generated property descriptions for real estate listings in the Houzie application. It leverages OpenAI's GPT models to generate compelling and concise descriptions that highlight key property features while considering user preferences based on their interaction history.

## Features

- Generates concise property descriptions (under 100 words)
- Personalizes content based on user preferences and history
- Integrates with OpenAI's GPT-4o-mini model
- Handles error cases gracefully

## Implementation Details

### Function Signature

```typescript
export async function generateAiDescription(
  listing: any,
  favourites: any[],
  history: any[]
): Promise
```

### Parameters

- **listing**: The property details object containing all information about the listing
- **favourites**: Array of user's favorite listings with complete details
- **history**: Array of user's search history or visited listings with complete details

### Prompt Construction

The function constructs a detailed prompt for the AI model that includes:

1. A clear instruction to act as a real estate expert
2. The complete property details in JSON format
3. The user's favorite listings (if available)
4. The user's search/visit history (if available)
5. Specific guidance to highlight key features and appeal to user preferences

### AI Model Configuration

- Uses OpenAI's `gpt-4o-mini` model for efficient generation
- Sets a maximum token limit of 300 to ensure concise output
- Uses a temperature of 0.7 to balance creativity and coherence

### Error Handling

The function implements try-catch error handling to:

- Log detailed error information
- Throw a standardized error message for consistent error handling upstream

## Usage Example

The function is used in the `FormService.findOne` method when a listing has AI description enabled:

```typescript
if (listing.descriptionAi && userId) {
  const userData = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      favorites: true,
      visitedListings: true,
    },
  });

  if (userData) {
    aiGeneratedDescription = await generateAiDescription(
      listing,
      userData.favorites,
      userData.visitedListings,
    );
  }
}
```

## Integration Points

The function integrates with:

1. **OpenAI SDK**: For AI model access via the `@ai-sdk/openai` package
2. **AI SDK**: For text generation via the `generateText` function
3. **User Model**: For accessing user preferences and history
4. **Listing Model**: For accessing property details
