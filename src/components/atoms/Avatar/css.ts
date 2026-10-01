import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('avatar-atom-css', `
.avatar {
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: var(--accent-gradient);
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
`)

export const avatarCss = {
  avatar: 'avatar',
} as const
