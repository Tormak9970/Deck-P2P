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
import { patchWifiSymbol } from "./patches/WifiSymbolPatch";

declare global {
  var SteamClient: SteamClient;
  let collectionStore: CollectionStore;
  let loginStore: LoginStore;
  // * This casing is correct, idk why it doesn't match the others.
  let securitystore: SecurityStore;
}

export default definePlugin((serverAPI: ServerAPI) => {
  PythonInterop.setServer(serverAPI);
  const pluginState = new PluginState()
  PluginController.setup(serverAPI, pluginState);

  patchWifiSymbol(pluginState);
  // TODO: repatch when system resumes
  // const unregisterOnResume = SteamClient.System.RegisterForOnResumeFromSuspend(patchSearchBar).unregister

  const loginUnregisterer = PluginController.initOnLogin(async () => {
    // TODO: perform the actual route patching here
    // ex: libraryPatch = patchLibrary(serverAPI);
  });

  return {
    title: <div className={staticClasses.Title}>AdHoc Hoster</div>,
    content:
      <PluginContextProvider pluginState={pluginState}>
        <QuickAccessContent pluginState={pluginState} />
      </PluginContextProvider>,
    icon: <LuNetwork />,
    onDismount: () => {
      loginUnregisterer.unregister();
      PluginController.dismount();
    },
  };
});
