import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { ErrorBanner } from '../components/ErrorBanner';
import { Heart } from 'lucide-react';

interface Joke {
  id: number;
  type: string;
  setup: string;
  punchline: string;
}

interface JokeCardProps {
  joke: Joke;
}

const JokeCard: React.FC<JokeCardProps> = ({ joke }) => {
  const [showPunchline, setShowPunchline] = useState(false);
  const [likes, setLikes] = useState(0);

  const handleLike = () => {
    setLikes(prev => prev + 1);
  };

  return (
    <div className="bg-joke-card border border-joke-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <p className="text-foreground text-base leading-relaxed">{joke.setup}</p>
      </div>
      
      {showPunchline && (
        <div className="mb-4 p-3 bg-accent rounded-md">
          <p className="text-accent-foreground font-medium">{joke.punchline}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowPunchline(!showPunchline)}
          className="text-sm"
        >
          {showPunchline ? 'Hide Punchline' : 'Show Punchline'}
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="text-like-button hover:bg-like-button/10"
          >
            <Heart className="h-4 w-4 mr-1" />
            {likes}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Jokes: React.FC = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJokes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://official-joke-api.appspot.com/jokes/ten');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch jokes: ${response.status}`);
        }
        
        const data = await response.json();
        setJokes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching jokes');
      } finally {
        setLoading(false);
      }
    };

    fetchJokes();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Dad Jokes</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-skeleton animate-pulse rounded-lg h-40"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Dad Jokes</h1>
      
      {error && <ErrorBanner message={error} />}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jokes.map((joke) => (
          <JokeCard key={joke.id} joke={joke} />
        ))}
      </div>
    </div>
  );
};

export default Jokes;