export function PerformanceVideo({ title, credit }) {
  return (
    <figure className="performance-video reveal">
      <video
        aria-label={title}
        className="performance-video__player"
        controls
        playsInline
        preload="none"
        poster="https://images.pexels.com/videos/9006072/pexels-photo-9006072.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      >
        <source
          src="https://videos.pexels.com/video-files/9006072/9006072-hd_1920_1080_25fps.mp4"
          type="video/mp4"
        />
        Your browser does not support the video element.
      </video>
      <figcaption className="performance-video__caption">
        <span>{title}</span>
        <span>{credit}</span>
      </figcaption>
    </figure>
  );
}
