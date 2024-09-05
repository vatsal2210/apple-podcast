import React, { useState } from "react";
import PodcastForm from "./components/PodcastForm";
import PodcastResult from "./components/PodcastResult";

function App() {
  const [podcastData, setPodcastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (url) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scrape-podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setPodcastData(data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Podcast Scraper</h1>
      <PodcastForm onSubmit={handleSubmit} />
      {isLoading && (
        <div className="text-center mt-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {podcastData && <PodcastResult data={podcastData} />}
    </div>
  );
}

export default App;
