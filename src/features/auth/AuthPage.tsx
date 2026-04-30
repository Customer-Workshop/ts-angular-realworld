import { useState, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Errors } from '../../models/errors.model';
import ListErrors from '../../components/ListErrors';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const isLogin = location.pathname === '/login';
  const title = isLogin ? 'Sign in' : 'Sign up';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({ errors: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = isLogin ? email !== '' && password !== '' : username !== '' && email !== '' && password !== '';

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({ errors: {} });

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ username, email, password });
      }
      navigate('/');
    } catch (err: unknown) {
      setErrors(err as Errors);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">{title}</h1>
            <p className="text-xs-center">
              {!isLogin ? <Link to="/login">Have an account?</Link> : <Link to="/register">Need an account?</Link>}
            </p>
            <ListErrors errors={errors} />
            <form onSubmit={submitForm}>
              <fieldset disabled={isSubmitting}>
                {!isLogin && (
                  <fieldset className="form-group">
                    <input
                      name="username"
                      placeholder="Username"
                      className="form-control form-control-lg"
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </fieldset>
                )}
                <fieldset className="form-group">
                  <input
                    name="email"
                    placeholder="Email"
                    className="form-control form-control-lg"
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    name="password"
                    placeholder="Password"
                    className="form-control form-control-lg"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" disabled={!isFormValid} type="submit">
                  {title}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
