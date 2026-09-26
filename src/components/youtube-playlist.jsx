export function YouTubePlaylist() {
  return (
    <div className="youtube-playlist reveal">
      <iframe
        className="youtube-playlist__frame"
        src="https://www.youtube.com/embed?listType=playlist&list=PL60SvPx7dT3UCrRKX3ORa3qXrLtFE_C8C"
        title="Zaheer Lohar YouTube Playlist"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
