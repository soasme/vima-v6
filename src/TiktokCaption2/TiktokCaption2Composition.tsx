import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, staticFile } from "remotion";
import { z } from "zod";
import { createTikTokStyleCaptions } from "@remotion/captions";

export const tiktokCaption2Schema = z.object({
  outputJsonPath: z.string(),
  combineTokensWithinMilliseconds: z.number().optional().default(1200),
});

export type TiktokCaption2Props = z.infer<typeof tiktokCaption2Schema>;

// Transform output.json format to Remotion Caption format
const transformOutputJsonToCaptions = (data: Array<{
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number;
}>) => {
  return data.map(item => ({
    text: item.text,
    startMs: item.startMs,
    endMs: item.endMs,
    timestampMs: item.timestampMs,
    confidence: item.confidence,
  }));
};

export const TiktokCaption2Composition: React.FC<TiktokCaption2Props> = ({
  outputJsonPath,
  combineTokensWithinMilliseconds = 1200,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  // Load caption data from output.json file
  const [captionData, setCaptionData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    console.log('Loading caption data from:', outputJsonPath);
    setLoading(true);
    setError(null);
    
    // Use staticFile for proper public file access in Remotion
    const filePath = staticFile(outputJsonPath.replace(/^\/+/, ''));
    console.log('Resolved static file path:', filePath);
    
    fetch(filePath)
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Caption data loaded:', data?.length, 'items');
        setCaptionData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading caption data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [outputJsonPath]);

  // Show loading or error states
  if (loading) {
    return (
      <AbsoluteFill style={{ backgroundColor: "transparent" }}>
        <div style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "16px 24px",
          backgroundColor: "rgba(255, 255, 0, 0.8)",
          borderRadius: "16px",
          color: "black",
          fontWeight: "bold"
        }}>
          Loading captions...
        </div>
      </AbsoluteFill>
    );
  }

  if (error) {
    return (
      <AbsoluteFill style={{ backgroundColor: "transparent" }}>
        <div style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "16px 24px",
          backgroundColor: "rgba(255, 0, 0, 0.8)",
          borderRadius: "16px",
          color: "white",
          fontWeight: "bold",
          maxWidth: "80%"
        }}>
          Error: {error}
        </div>
      </AbsoluteFill>
    );
  }

  if (!captionData || captionData.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "transparent" }}>
        <div style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "16px 24px",
          backgroundColor: "rgba(255, 165, 0, 0.8)",
          borderRadius: "16px",
          color: "black",
          fontWeight: "bold"
        }}>
          No caption data found
        </div>
      </AbsoluteFill>
    );
  }

  // Transform and create TikTok-style captions
  const captions = transformOutputJsonToCaptions(captionData);
  console.log('Transformed captions:', captions.length);
  
  // Custom function to create pages with capital letter split logic
  const createCustomTikTokPages = (captions: any[], combineTokensWithinMs: number) => {
    const pages: any[] = [];
    let currentPage: any = null;
    
    for (let i = 0; i < captions.length; i++) {
      const caption = captions[i];
      const nextCaption = captions[i + 1];
      
      // Check if current word starts with capital letter (excluding whitespace)
      const trimmedText = caption.text.trim();
      const currentWordStartsWithCapital = trimmedText.length > 0 && 
        /^[A-Z]/.test(trimmedText);
      
      // Exceptions: Don't split on these capital words
      const capitalExceptions = ['I']; // Single letter "I"
      const isCapitalException = capitalExceptions.includes(trimmedText);
      
      // Also don't split if the previous word ended with a comma (indicating continuation)
      const previousCaption = i > 0 ? captions[i - 1] : null;
      const previousWordEndsWithComma = previousCaption && 
        previousCaption.text.trim().endsWith(',');
      
      // Start a new page if this is the first caption
      if (!currentPage) {
        currentPage = {
          text: caption.text,
          startMs: caption.startMs,
          durationMs: caption.endMs - caption.startMs,
          tokens: [caption]
        };
      } else {
        // Check if we should combine with current page
        const timeDiff = caption.startMs - (currentPage.startMs + currentPage.durationMs);
        const timeAllowsCombining = timeDiff <= combineTokensWithinMs;
        
        // Don't combine if current word starts with capital, unless it's an exception or follows a comma
        const shouldSplitOnCapital = currentWordStartsWithCapital && 
          !isCapitalException && 
          !previousWordEndsWithComma;
        
        if (timeAllowsCombining && !shouldSplitOnCapital) {
          // Add to current page
          currentPage.text += caption.text;
          currentPage.durationMs = caption.endMs - currentPage.startMs;
          currentPage.tokens.push(caption);
        } else {
          // Finish current page and start new one
          pages.push(currentPage);
          currentPage = {
            text: caption.text,
            startMs: caption.startMs,
            durationMs: caption.endMs - caption.startMs,
            tokens: [caption]
          };
        }
      }
    }
    
    // Add the last page if it exists
    if (currentPage) {
      pages.push(currentPage);
    }
    
    return { pages };
  };
  
  const { pages } = createCustomTikTokPages(captions, combineTokensWithinMilliseconds);
  
  console.log('Generated pages:', pages.length, 'at time:', timeMs);

  // Find current page
  const currentPage = pages.find(
    (page) => timeMs >= page.startMs && timeMs < page.startMs + page.durationMs
  );

  // Calculate which tokens to highlight
  const getHighlightedTokens = (page: any) => {
    if (!page) return [];
    
    return page.tokens.map((token: any, index: number) => {
      const tokenStartMs = token.startMs;
      const tokenEndMs = token.endMs;
      const isActive = timeMs >= tokenStartMs && timeMs < tokenEndMs;
      
      return {
        ...token,
        isActive,
        index,
      };
    });
  };

  const highlightedTokens = currentPage ? getHighlightedTokens(currentPage) : [];

  // Calculate spring animation for page appearance
  const getSpringScale = () => {
    if (!currentPage) return 0;
    
    const framesIntoPage = (timeMs - currentPage.startMs) / 1000 * fps;
    const springFrame = Math.min(framesIntoPage, 20);
    
    return spring({
      frame: springFrame,
      fps,
      config: {
        damping: 12,
        stiffness: 120,
        mass: 0.3,
      },
    });
  };

  // Colors for active/inactive text
  const getTokenStyle = (token: any) => {
    const baseStyle = {
      transition: 'all 0.1s ease',
      display: 'inline',
    };

    if (token.isActive) {
      return {
        ...baseStyle,
        color: '#FFD700', // Gold for active word
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        transform: 'scale(1.1)',
      };
    }

    return {
      ...baseStyle,
      color: '#FFFFFF', // White for inactive words
      textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
    };
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {currentPage && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: "50%",
            transform: `translateX(-50%) scale(${getSpringScale()})`,
            textAlign: "center",
            fontSize: "64px",
            fontWeight: "bold",
            padding: "16px 24px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "16px",
            display: "inline-block",
            maxWidth: "90%",
            lineHeight: 1.2,
          }}
        >
          {highlightedTokens.map((token, index) => (
            <span
              key={index}
              style={getTokenStyle(token)}
            >
              {token.text}
            </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};