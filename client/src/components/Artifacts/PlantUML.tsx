import React, { useEffect, useState } from 'react';

// PlantUML Text Encoding implementation based on official documentation
// https://plantuml.com/text-encoding
// To achieve such encoding, the text diagram is:
// 1. Encoded in UTF-8
// 2. Compressed using Deflate algorithm
// 3. Reencoded in ASCII using a transformation close to base64

// Import pako for proper Deflate compression
import pako from 'pako';

function encode6bit(b: number): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  if (b < 0 || b > 63) {
    return '?';
  }
  return charset.charAt(b);
}

function append3bytes(b1: number, b2: number, b3: number): string {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;

  let result = '';
  result += encode6bit(c1 & 0x3f);
  result += encode6bit(c2 & 0x3f);
  result += encode6bit(c3 & 0x3f);
  result += encode6bit(c4 & 0x3f);
  return result;
}

function encodePlantUMLText(text: string): string {
  try {
    // Step 1: Convert text to UTF-8 bytes
    const textEncoder = new TextEncoder();
    const utf8bytes = textEncoder.encode(text);

    // Step 2: Compress using RAW Deflate (no zlib header)
    const compressed = pako.deflate(utf8bytes);

    // Step 3: Reencode in ASCII using transformation close to base64
    let result = '';
    for (let i = 0; i < compressed.length; i += 3) {
      const b1 = compressed[i] || 0;
      const b2 = compressed[i + 1] || 0;
      const b3 = compressed[i + 2] || 0;
      result += append3bytes(b1, b2, b3);
    }

    return result;
  } catch (error) {
    console.error('PlantUML encoding error:', error);
    throw new Error('Failed to encode PlantUML text');
  }
}

interface PlantUMLDiagramProps {
  content: string;
}

const PlantUMLDiagram: React.FC<PlantUMLDiagramProps> = ({ content }) => {
  const [diagramSrc, setDiagramSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Clean the content - remove @startuml/@enduml if present and add them
        let cleanContent = content.trim();
        if (cleanContent.startsWith('@startuml')) {
          cleanContent = cleanContent.replace(/^@startuml\s*/, '').replace(/@enduml\s*$/, '');
        }

        const plantUMLContent = `@startuml
${cleanContent}
@enduml`;

        // Encode using proper PlantUML text encoding
        const encoded = encodePlantUMLText(plantUMLContent);
        const imageUrl = `https://www.plantuml.com/plantuml/svg/~1${encoded}`;

        setDiagramSrc(imageUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('PlantUML rendering error:', error);
        setError('Error rendering PlantUML diagram');
        setIsLoading(false);
      }
    };

    if (content) {
      renderDiagram();
    }
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center bg-gray-50 p-4">
        <div className="text-gray-600">Loading diagram...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full items-center justify-center bg-gray-50 p-4">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center rounded border bg-white p-4">
      <img
        src={diagramSrc}
        alt="PlantUML Diagram"
        style={{ maxWidth: '100%', height: 'auto' }}
        onError={() => setError('Failed to load diagram')}
      />
    </div>
  );
};

export default PlantUMLDiagram;
