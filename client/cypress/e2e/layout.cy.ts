import { checkLocationWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { navigationTabs } from 'src/constants/navigationTabs/navigationTabs';
import { ROOT } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`layout: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.clearLocalStorage();
      cy.setupMetamask();
      cy.activateShowTestnetNetworksInMetamask();
      cy.changeMetamaskNetwork('sepolia');
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    beforeEach(() => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      cy.visit(ROOT.absolute);
    });

    it('renders top bar', () => {
      cy.get('[data-test=MainLayout__Header]').should('be.visible');
    });

    it('renders bottom navbar', () => {
      cy.get('[data-test=Navbar]').should('be.visible');
    });

    it('bottom navbar allows to change views', () => {
      navigationTabs.forEach(({ label, to }) => {
        cy.get(`[data-test=Navbar__Button--${label}]`).click();
        checkLocationWithLoader(to);
      });
    });

    it('"Connect" button is visible when wallet is disconnected', () => {
      cy.get('[data-test=MainLayout__Button--connect]').should('be.visible');
      cy.get('[data-test=MainLayout__Button--connect]').click();
    });

    it('"Connect" button opens "ModalConnectWallet"', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet]').should('be.visible');
    });

    it('"ModalConnectWallet" always shows "WalletConnect" option', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet]').within(() => {
        cy.get('[data-test=ConnectWallet__BoxRounded--walletConnect]').should('be.visible');
      });
    });

    it('"ModalConnectWallet" shows "Browser wallet" and "WalletConnect" options (MetaMask wallet detected)', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet]').within(() => {
        cy.get('[data-test=ConnectWallet__BoxRounded--walletConnect]').should('be.visible');
        cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').should('be.visible');
      });
    });

    it('"ModalConnectWallet" has overflow enabled', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet__overflow]').should('exist');
    });

    it('Clicking background when "ModalConnectWallet" is open, closes Modal', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet__overflow]').click({ force: true });
      cy.get('[data-test=ModalConnectWallet]').should('not.exist');
    });

    it('"ModalConnectWallet" has "cross" icon button in header', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet__Button]').should('be.visible');
    });

    it('Clicking on "X" mark in "ModalConnectWallet", closes Modal', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ModalConnectWallet__Button]').click();
      cy.get('[data-test=ModalConnectWallet]').should('not.exist');
    });

    it('Clicking on "WalletConnect" option, opens Web3Modal', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ConnectWallet__BoxRounded--walletConnect]').click();
      cy.get('w3m-modal').find('#w3m-modal', { includeShadowDom: true }).should('be.visible');
    });

    it('Clicking on "Browser wallet" option connects with MetaMask wallet', () => {
      cy.get('[data-test=MainLayout__Button--connect]').click();
      cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').click();
      cy.switchToMetamaskNotification();
      cy.acceptMetamaskAccess();
      cy.get('[data-test=MainLayout__Button--connect]').should('not.exist');
      cy.get('[data-test=ProfileInfo]').should('be.visible');
    });
  });
});
