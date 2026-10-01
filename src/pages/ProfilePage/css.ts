import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('profile-page-css', `
.profile-hero {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-hero__text {
  min-width: 0;
}

.profile-hero__text p {
  margin: 0;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-genres {
  margin: 4px 0 20px;
  padding: 0;
  border: none;
}

.profile-genres legend {
  padding: 0;
  margin-bottom: 4px;
  font-size: 14px;
}

.profile-genres__hint {
  margin: 0 0 12px;
  color: var(--text-secondary);
  font-size: 13px;
}

.profile-genres__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.profile-genre {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--bg-panel-alt);
  color: var(--text-secondary);
  font-size: 13px;
}

.profile-genre:hover {
  border-color: var(--accent-purple);
}

.profile-genre--active {
  border-color: var(--accent-purple);
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
  font-weight: 600;
}

.profile-projects {
  display: flex;
  flex-direction: column;
}

.profile-project {
  padding: 14px 0;
  display: flex;
  align-items: center;
  gap: 14px;
  border-top: 1px solid var(--border);
}

.profile-project__icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-purple);
  background: var(--accent-purple-soft);
}

.profile-project__info {
  flex: 1;
  min-width: 0;
}

.profile-project__info a {
  color: var(--text-primary);
  font-weight: 600;
  text-decoration: none;
}

.profile-project__info a:hover {
  color: var(--accent-purple);
}

.profile-project__info p {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.profile-projects__empty {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

@media (max-width: 560px) {
  .profile-hero {
    align-items: flex-start;
    flex-direction: column;
  }
}
`)

export const profilePageCss = {
  hero: 'profile-hero',
  heroText: 'profile-hero__text',
  genres: 'profile-genres',
  genresHint: 'profile-genres__hint',
  genresList: 'profile-genres__list',
  genre: 'profile-genre',
  genreActive: 'profile-genre profile-genre--active',
  projects: 'profile-projects',
  project: 'profile-project',
  projectIcon: 'profile-project__icon',
  projectInfo: 'profile-project__info',
  projectsEmpty: 'profile-projects__empty',
} as const
