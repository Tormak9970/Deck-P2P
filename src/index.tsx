import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";

import { LuNetwork } from "react-icons/lu";

import { PluginController } from "./lib/controllers/PluginController";
import { PythonInterop } from "./lib/controllers/PythonInterop";
import { PluginContextProvider } from "./state/PluginContext";
import { PluginState } from "./state/PluginState";
import { QuickAccessContent } from "./components/QuickAccessContent";
import { patchWifiSymbol, unpatchWifiSymbol } from "./patches/WifiSymbolPatch";
import { patchGamePage } from "./patches/GamePagePatch";

declare global {
  var SteamClient: SteamClient;
  let loginStore: LoginStore;
  let appStore: AppStore;
  // * This casing is correct, idk why it doesn't match the others.
  let securitystore: SecurityStore;
}

export default definePlugin((serverAPI: ServerAPI) => {
  PythonInterop.setServer(serverAPI);
  const pluginState = new PluginState()
  PluginController.setup(pluginState);

  patchWifiSymbol(pluginState);
  const gamePagePatch = patchGamePage(serverAPI, pluginState);
  
  const unregisterOnResume = SteamClient.System.RegisterForOnResumeFromSuspend(() => patchWifiSymbol(pluginState)).unregister;
  const loginUnregisterer = PluginController.initOnLogin(async () => { });

  return {
    title: <div className={staticClasses.Title}>Deck P2P</div>,
    content:
      <PluginContextProvider pluginState={pluginState}>
        <QuickAccessContent pluginState={pluginState} />
      </PluginContextProvider>,
    icon: <LuNetwork />,
    onDismount: () => {
      loginUnregisterer.unregister();
      unpatchWifiSymbol();
      unregisterOnResume();
      
      serverAPI.routerHook.removePatch('/library/app/:appid', gamePagePatch);
      PluginController.dismount();
    },
  };
});
