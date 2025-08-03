function AnalizButton({ sendRules, rules }) {
  return (
    <button className="analiz-btn" onClick={() => sendRules(rules)}>
      <span className="analiz-btn-text">Çakışma Analizi Yap</span>
    </button>
  );
}

export default AnalizButton;
