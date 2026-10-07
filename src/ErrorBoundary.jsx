import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("Dragons app crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            fontFamily: "monospace",
            background: "#0e1511",
            color: "#e7efea",
            minHeight: "100vh",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <h1 style={{ color: "#f2b632", fontSize: 18 }}>
            Une erreur a arrêté l'affichage de cette page
          </h1>
          <p>Copie ce message et envoie-le pour qu'on corrige le problème :</p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#121a15",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(63, 174, 116,0.25)",
              fontSize: 13,
            }}
          >
            {String(this.state.error && this.state.error.stack ? this.state.error.stack : this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              background: "#3fae74",
              color: "#06130c",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
