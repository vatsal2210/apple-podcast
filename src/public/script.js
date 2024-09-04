document.getElementById("podcastForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = document.getElementById("podcastUrl").value;
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML =
    '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

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
      resultDiv.innerHTML = `
        <div class="row mb-4">
          <div class="col-md-3">
            <img src="${data.artwork}" alt="${
        data.title
      }" class="img-fluid rounded">
          </div>
          <div class="col-md-9">
            <h2>${data.title}</h2>
            <h5 class="text-muted">${data.author} | ${
        data.itunesSubtitle || ""
      }</h5>
            <p class="mb-1"><small>${data.episodeCount} episodes · ${
        data.itunesCategories
          ? Object.values(data.itunesCategories)[0]
          : "Uncategorized"
      } · Updated ${
        data.lastBuildDate
          ? new Date(data.lastBuildDate).toLocaleDateString()
          : "daily"
      }</small></p>
            <p>${
              data.itunesSummary ||
              data.description ||
              "No description available"
            }</p>
           
          </div>
        </div>
        <h3 class="mb-3">Episodes</h3>
        <div class="list-group">
          ${data.episodes
            .map(
              (ep, index) => `
            <div class="list-group-item">
              <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h5 class="mb-1">${ep.title}</h5>
                  <p class="mb-1"><small>${new Date(
                    ep.pubDate
                  ).toLocaleDateString()} · ${
                ep.duration
                  ? Math.floor(ep.duration / 60) + " min"
                  : "Unknown duration"
              }</small></p>
                  <p class="mb-1">${ep.description}</p>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-secondary copy-link" data-url="${
                    ep.enclosureUrl
                  }"><i class="bi bi-clipboard"></i></button>
                  <a href="${
                    ep.enclosureUrl
                  }" class="btn btn-sm btn-primary" download><i class="bi bi-download"></i></a>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;

      // Add event listeners for copy link buttons
      document.querySelectorAll(".copy-link").forEach((button) => {
        button.addEventListener("click", () => {
          const url = button.getAttribute("data-url");
          navigator.clipboard.writeText(url).then(() => {
            button.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(() => {
              button.innerHTML = '<i class="bi bi-clipboard"></i> Copy Link';
            }, 2000);
          });
        });
      });
    } else {
      resultDiv.innerHTML = `<div class="alert alert-danger" role="alert">Error: ${data.error}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="alert alert-danger" role="alert">Error: ${error.message}</div>`;
  }
});
