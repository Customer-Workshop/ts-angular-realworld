import { useState, useEffect, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Errors } from '../../models/errors.model';
import * as articlesService from '../../services/articles.service';
import ListErrors from '../../components/ListErrors';

export default function EditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagField, setTagField] = useState('');
  const [errors, setErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      articlesService.get(slug).then(article => {
        if (currentUser?.username === article.author.username) {
          setTitle(article.title);
          setDescription(article.description);
          setBody(article.body);
          setTagList(article.tagList);
        } else {
          navigate('/');
        }
      });
    }
  }, [slug, currentUser, navigate]);

  const addTag = () => {
    const tag = tagField.trim();
    if (tag !== '' && !tagList.includes(tag)) {
      setTagList(prev => [...prev, tag]);
    }
    setTagField('');
  };

  const removeTag = (tagName: string) => {
    setTagList(prev => prev.filter(t => t !== tagName));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    addTag();

    const articleData = {
      title,
      description,
      body,
      tagList,
    };

    try {
      const article = slug
        ? await articlesService.update({ ...articleData, slug })
        : await articlesService.create(articleData);
      navigate(`/article/${article.slug}`);
    } catch (err: unknown) {
      setErrors(err as Errors);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ListErrors errors={errors} />

            <form>
              <fieldset disabled={isSubmitting}>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    name="title"
                    type="text"
                    placeholder="Article Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control"
                    name="description"
                    type="text"
                    placeholder="What's this article about?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    name="body"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                  ></textarea>
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter tags"
                    value={tagField}
                    onChange={e => setTagField(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <div className="tag-list">
                    {tagList.map(tag => (
                      <span key={tag} className="tag-default tag-pill">
                        <i className="ion-close-round" onClick={() => removeTag(tag)}></i>
                        {tag}
                      </span>
                    ))}
                  </div>
                </fieldset>

                <button className="btn btn-lg pull-xs-right btn-primary" type="button" onClick={submitForm}>
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
