export default function PlaylistsLoading() {
  return (
    <main className="playlists-page playlist-route-loading" aria-label="Loading playlist library">
      <section className="playlist-route-loading__hero"><div className="page-shell"><span /><span /><span /></div></section>
      <section className="page-shell"><div className="playlist-grid">{Array.from({ length: 6 }, (_, index) => <div className="playlist-skeleton" key={index}><div className="playlist-skeleton__art" /><div className="playlist-skeleton__line playlist-skeleton__line--title" /><div className="playlist-skeleton__line" /></div>)}</div></section>
    </main>
  );
}
