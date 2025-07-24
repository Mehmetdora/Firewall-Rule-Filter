

export default function GroupRulesButton({ onClick }) {
  return (
    <button className="group-rules-btn" onClick={onClick}>
      <span className="group-rules-btn-text">Group Rules</span>
    </button>
  );
}