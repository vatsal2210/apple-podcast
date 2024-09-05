import React from "react";

function PodcastResult({ data }) {
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row mb-8">
        <div className="md:w-1/4 mb-4 md:mb-0">
          <img
            src={data.artwork}
            alt={data.title}
            className="w-full rounded-md"
          />
        </div>
        <div className="md:w-3/4 md:pl-8">
          <h2 className="text-2xl font-bold">{data.title}</h2>
          <h5 className="text-gray-600">
            {data.author} | {data.itunesSubtitle || ""}
          </h5>
          <p className="text-sm text-gray-500 mb-2">
            {data.episodeCount} episodes ·
            {data.itunesCategories
              ? Object.values(data.itunesCategories)[0]
              : "Uncategorized"}{" "}
            · Updated{" "}
            {data.lastBuildDate
              ? new Date(data.lastBuildDate).toLocaleDateString()
              : "daily"}
          </p>
          <p>
            {data.itunesSummary ||
              data.description ||
              "No description available"}
          </p>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4">Episodes</h3>
      <div className="space-y-4">
        {data.episodes.map((ep, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-bold">{ep.title}</h5>
                <p className="text-sm text-gray-500">
                  {new Date(ep.pubDate).toLocaleDateString()} ·
                  {ep.duration
                    ? Math.floor(ep.duration / 60) + " min"
                    : "Unknown duration"}
                </p>
                <p className="mt-2">{ep.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(ep.enclosureUrl)}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <i className="bi bi-clipboard"></i>
                </button>
                <a
                  href={ep.enclosureUrl}
                  download
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <i className="bi bi-download"></i>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PodcastResult;
