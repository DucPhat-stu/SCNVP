export function AuthBackground() {
  return (
    <div className="auth-bg" aria-hidden="true">
      <div className="auth-bg__grid" />
      <div className="auth-bg__wave" />
      <div className="auth-city">
        <div className="auth-city__block auth-city__block--one">
          <span />
          <span />
          <span />
        </div>
        <div className="auth-city__block auth-city__block--two">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="auth-city__block auth-city__block--three">
          <span />
          <span />
        </div>
        <div className="auth-city__block auth-city__block--four">
          <span />
          <span />
          <span />
        </div>
        <div className="auth-city__block auth-city__block--five">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="auth-city__tower auth-city__tower--one" />
        <div className="auth-city__tower auth-city__tower--two" />
        <div className="auth-city__tower auth-city__tower--three" />
        <div className="auth-city__road auth-city__road--one">
          <span className="auth-city__car auth-city__car--one" />
        </div>
        <div className="auth-city__road auth-city__road--two">
          <span className="auth-city__car auth-city__car--two" />
        </div>
        <div className="auth-city__road auth-city__road--three">
          <span className="auth-city__car auth-city__car--three" />
        </div>
        <div className="auth-city__road auth-city__road--four">
          <span className="auth-city__car auth-city__car--four" />
        </div>
        <span className="auth-city__signal auth-city__signal--one" />
        <span className="auth-city__signal auth-city__signal--two" />
      </div>
    </div>
  );
}
