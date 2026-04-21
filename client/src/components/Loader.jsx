import "./Loader.css";

const Loader = ({
  title = "Preparing the logistics network",
  subtitle = "Optimizing routes, syncing fleet intelligence, and refreshing insights.",
}) => {
  return (
    <div className="loader-wrapper">
      <div className="loader-shell">
        <div className="loader-orbit">
          <div className="loader-core"></div>
          <div className="loader-ring loader-ring-one"></div>
          <div className="loader-ring loader-ring-two"></div>
        </div>

        <div className="loader-copy">
          <p className="loader-kicker">PostalX Control Tower</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="loader-progress">
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
