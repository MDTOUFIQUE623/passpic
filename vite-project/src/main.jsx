import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const clerkAppearance = {
  baseTheme: "dark",
  variables: {
    colorPrimary: '#f97316',
    colorTextOnPrimaryBackground: 'white',
    colorBackground: 'rgba(11, 17, 32, 0.6)',
    colorInputBackground: 'rgba(17, 24, 39, 0.4)',
    colorInputText: 'white',
    colorTextSecondary: '#ffffff',
    borderRadius: '12px',
  },
  elements: {
    card: {
      backgroundColor: 'rgba(11, 17, 32, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(249, 115, 22, 0.2)',
      borderRadius: '24px',
      boxShadow: `
        0 0 40px rgba(249, 115, 22, 0.1),
        inset 0 0 20px rgba(249, 115, 22, 0.05)
      `,
      width: '400px',
      maxWidth: '90vw',
      padding: '2.5rem',
      opacity: '0',
      animation: 'fadeIn 0.5s ease forwards',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '24px',
        background: 'linear-gradient(45deg, rgba(249, 115, 22, 0.1), transparent)',
        pointerEvents: 'none'
      }
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: '600',
      background: 'linear-gradient(to right, #f97316, #eab308)', // Orange to yellow gradient
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '2rem'
    },
    formButtonPrimary: {
      background: 'linear-gradient(45deg, #f97316, #eab308)',
      backdropFilter: 'blur(8px)',
      color: 'white',
      fontSize: '1rem',
      fontWeight: '500',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      border: 'none',
      width: '100%',
      marginTop: '1rem',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        opacity: 0.95,
        transform: 'translateY(-1px)',
        boxShadow: '0 0 30px rgba(249, 115, 22, 0.2)'
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: -100,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        animation: 'shimmer 2s infinite'
      }
    },
    formFieldLabel: {
      color: 'white !important'
    },
    formFieldInput: {
      backgroundColor: 'rgba(17, 24, 39, 0.3)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(249, 115, 22, 0.2)',
      color: 'white !important',
      borderRadius: '12px',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      '&:focus': {
        border: '1px solid rgba(249, 115, 22, 0.5)',
        boxShadow: '0 0 20px rgba(249, 115, 22, 0.1)',
        backgroundColor: 'rgba(17, 24, 39, 0.4)'
      }
    },
    dividerText: {
      color: '#ffffff',
      fontSize: '0.9rem'
    },
    dividerLine: {
      backgroundColor: 'rgba(249, 115, 22, 0.2)'
    },
    socialButtonsButton: {
      backgroundColor: 'rgba(17, 24, 39, 0.3)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(249, 115, 22, 0.2)',
      borderRadius: '12px',
      color: 'white !important',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        border: '1px solid rgba(249, 115, 22, 0.4)',
        boxShadow: '0 0 20px rgba(249, 115, 22, 0.1)'
      }
    },
    socialButtonsIconButton: {
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      border: '1px solid rgba(249, 115, 22, 0.2)',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        border: '1px solid rgba(249, 115, 22, 0.4)'
      }
    },
    footer: {
      display: 'none !important'
    },
    alternativeMethodsBlock: {
      marginTop: '1.5rem'
    },
    formFieldAction: {
      color: '#f97316',
      '&:hover': {
        color: '#eab308'
      }
    },
    identityPreviewText: {
      color: 'white'
    },
    identityPreviewEditButton: {
      color: '#f97316',
      '&:hover': {
        color: '#eab308'
      }
    },
    navbar: {
      display: 'none'
    },
    navbarButton: {
      display: 'none'
    },
    // Remove development mode text
    developmentBadge: {
      display: 'none'
    },
    // Ensure all social button text is white
    socialButtonsBlockButton: {
      color: 'white !important',
      width: '100%',
      padding: '1rem',
      fontSize: '1.1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      transform: 'scale(1)',
      opacity: '0',
      animation: 'fadeInScale 0.5s ease forwards',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.02)',
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        boxShadow: '0 4px 20px rgba(249, 115, 22, 0.2)'
      }
    },
    socialButtonsProviderIcon: {
      width: '24px',
      height: '24px'
    },
    socialButtonsBlock: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginTop: '1rem',
      opacity: '0',
      animation: 'fadeIn 0.5s ease forwards 0.2s'
    },
    userButtonBox: {
      width: '42px',
      height: '42px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)'
      }
    },
    userButtonTrigger: {
      width: '42px',
      height: '42px',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)'
      }
    },
    userButtonAvatarBox: {
      width: '42px',
      height: '42px'
    },
    avatarBox: {
      width: '42px',
      height: '42px'
    },
    userButtonPopoverCard: {
      backgroundColor: 'rgba(11, 17, 32, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(249, 115, 22, 0.2)',
      borderRadius: '16px',
      boxShadow: `
        0 4px 20px rgba(0, 0, 0, 0.2),
        inset 0 0 20px rgba(249, 115, 22, 0.05)
      `,
      animation: 'fadeInScale 0.2s ease forwards',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '16px',
        background: 'linear-gradient(45deg, rgba(249, 115, 22, 0.1), transparent)',
        pointerEvents: 'none'
      }
    },
    userPreviewMainIdentifier: {
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: '600'
    },
    userPreviewSecondaryIdentifier: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.9rem'
    },
    userButtonPopoverActions: {
      color: 'white'
    },
    userButtonPopoverActionButton: {
      color: 'white',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        color: '#f97316'
      }
    },
    userPreviewTextContainer: {
      color: 'white'
    },
    userButtonPopoverActionButtonText: {
      color: 'white'
    },
    userButtonPopoverFooter: {
      color: 'white'
    },
    // Additional elements to completely remove "Secured by Clerk"
    footerActionText: {
      display: 'none'
    },
    profileSectionFooter: {
      display: 'none'
    },
    profileSectionFooterAction: {
      display: 'none'
    },
    profileSectionFooterActionLink: {
      display: 'none'
    },
    userProfilePage: {
      '& footer': {
        display: 'none !important'
      }
    },
    // Force hide any clerk branding
    '*[class*="cl-footer"]': {
      display: 'none !important'
    },
    // Hide any remaining clerk references
    clerk: {
      display: 'none'
    },
    // Make all text elements white
    page: {
      color: 'white !important',
      '& *': {
        color: 'white !important'
      }
    },

    profileSection: {
      color: 'white !important',
      '& *': {
        color: 'white !important'
      }
    },

    profileSectionTitle: {
      color: 'white !important'
    },

    profileSectionSubtitle: {
      color: 'white !important'
    },

    profileSectionPrimaryButton: {
      color: 'white !important'
    },

    profileSectionContent: {
      color: 'white !important',
      '& *': {
        color: 'white !important'
      }
    },

    accordionTriggerButton: {
      color: 'white !important'
    },

    formFieldLabel: {
      color: 'white !important'
    },

    formFieldInput: {
      color: 'white !important'
    },

    formFieldInputShowPasswordButton: {
      color: 'white !important'
    },

    formResendCodeLink: {
      color: 'white !important'
    },

    otpCodeFieldInput: {
      color: 'white !important'
    },

    alertText: {
      color: 'white !important'
    },

    selectButton: {
      color: 'white !important'
    },

    selectContent: {
      color: 'white !important'
    },

    selectOptionText: {
      color: 'white !important'
    },

    headerSubtitle: {
      color: 'white !important'
    },

    // Make all text in connected accounts white
    connectedAccountsText: {
      color: 'white !important'
    },

    connectedAccountsLabel: {
      color: 'white !important'
    },

    // Email addresses section
    emailAddressText: {
      color: 'white !important'
    },

    emailAddressLabel: {
      color: 'white !important'
    },

    // Force all text elements to be white using a catch-all rule
    '& *': {
      color: 'white !important'
    },

    // Add these new styles for the delete account section
    dangerSection: {
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(220, 38, 38, 0.2)',
      padding: '1.5rem',
      marginTop: '2rem'
    },
    dangerSectionTitle: {
      color: 'rgb(239, 68, 68) !important',
      fontSize: '1.2rem',
      fontWeight: '600'
    },
    dangerSectionText: {
      color: 'rgba(255, 255, 255, 0.8) !important'
    },
    deleteParagraph: {
      color: 'rgba(255, 255, 255, 0.8) !important'
    },
    deleteAccountButton: {
      backgroundColor: 'rgb(220, 38, 38)',
      color: 'white !important',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgb(185, 28, 28)',
        transform: 'translateY(-1px)'
      }
    }
  }
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      <App />
    </ClerkProvider>
  </BrowserRouter>,
)

