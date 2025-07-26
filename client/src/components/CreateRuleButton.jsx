export default function CreateRuleButton({ onClick }) {
  return (
    <button className="group-rules-btn" onClick={onClick}>
      <span className="group-rules-btn-text">Create New Rule</span>
    </button>
  );
}
