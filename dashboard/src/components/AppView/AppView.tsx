import { RouterAction } from "connected-react-router";
import * as yaml from "js-yaml";
import * as _ from "lodash";
import * as React from "react";

// import AccessURLTable from "../../containers/AccessURLTableContainer";
// import DeploymentStatus from "../../containers/DeploymentStatusContainer";
import ResourceRef from "../../shared/ResourceRef";
import { IK8sList, IRBACRole, IRelease, IResource } from "../../shared/types";
import { ErrorSelector } from "../ErrorAlert";
import LoadingWrapper from "../LoadingWrapper";
// import AppControls from "./AppControls";
// import AppNotes from "./AppNotes";
import "./AppView.css";
import ChartInfo from "./ChartInfo";
// import DeploymentsTable from "./DeploymentsTable";
import OtherResourcesTable from "./OtherResourcesTable";
// import SecretsTable from "./SecretsTable";
// import ServicesTable from "./ServicesTable";

export interface IAppViewProps {
  namespace: string;
  releaseName: string;
  app: IRelease;
  // TODO(miguel) how to make optional props? I tried adding error? but the container complains
  error: Error | undefined;
  deleteError: Error | undefined;
  getAppWithUpdateInfo: (releaseName: string, namespace: string) => void;
  deleteApp: (releaseName: string, namespace: string, purge: boolean) => Promise<boolean>;
  // TODO: remove once WebSockets are moved to Redux store (#882)
  receiveResource: (p: { key: string; resource: IResource }) => void;
  push: (location: string) => RouterAction;
}

interface IAppViewState {
  resourceRefs: ResourceRef[];
  // Other resources are not stored as refs because we are not fetching any
  // information for them.
  otherResources: IResource[];
}

const RequiredRBACRoles: { [s: string]: IRBACRole[] } = {
  view: [
    {
      apiGroup: "apps",
      resource: "deployments",
      verbs: ["list", "watch"],
    },
    {
      apiGroup: "apps",
      resource: "services",
      verbs: ["list", "watch"],
    },
  ],
};

export default class AppView extends React.Component<IAppViewProps, IAppViewState> {
  public state: IAppViewState = {
    otherResources: [],
    resourceRefs: [],
  };

  public componentDidMount() {
    const { releaseName, getAppWithUpdateInfo, namespace } = this.props;
    getAppWithUpdateInfo(releaseName, namespace);
  }

  // componentWillReceiveProps is deprecated use componentDidUpdate instead
  public componentWillReceiveProps(nextProps: IAppViewProps) {
    const { releaseName, getAppWithUpdateInfo, namespace } = this.props;
    if (nextProps.namespace !== namespace) {
      getAppWithUpdateInfo(releaseName, nextProps.namespace);
      return;
    }
    if (nextProps.error) {
      return;
    }
    const newApp = nextProps.app;
    if (!newApp) {
      return;
    }

    // TODO(prydonius): Okay to use non-safe load here since we assume the
    // manifest is pre-parsed by Helm and Kubernetes. Look into switching back
    // to safeLoadAll once https://github.com/nodeca/js-yaml/issues/456 is
    // resolved.
    const manifest: IResource[] = yaml.loadAll(newApp.manifest, undefined, { json: true });

    // Iterate over the current manifest to populate the initial state
    this.setState(this.parseResources(manifest, newApp.namespace));
  }

  public render() {
    if (this.props.error) {
      return (
        <ErrorSelector
          error={this.props.error}
          defaultRequiredRBACRoles={RequiredRBACRoles}
          action="view"
          resource={`Application ${this.props.releaseName}`}
          namespace={this.props.namespace}
        />
      );
    }

    return this.props.app && this.props.app.info ? this.appInfo() : <LoadingWrapper />;
  }

  public appInfo() {
    const { app } = this.props;
    const { otherResources } = this.state;
    return (
      <section className="AppView padding-b-big">
        <main>
          <div className="container">
            {this.props.deleteError && (
              <ErrorSelector
                error={this.props.deleteError}
                defaultRequiredRBACRoles={RequiredRBACRoles}
                action="delete"
                resource={`Application ${this.props.releaseName}`}
                namespace={this.props.namespace}
              />
            )}
            <div className="row collapse-b-tablet">
              <div className="col-3">
                <ChartInfo app={app} />
              </div>
              <div className="col-9">
                {/* <div className="row padding-t-bigger"> */}
                {/* <div className="col-4"> */}
                {/* <DeploymentStatus deployRefs={deployRefs} info={app.info!} />
                  </div>
                  <div className="col-8 text-r">
                    <AppControls app={app} deleteApp={this.deleteApp} push={push} />
                  </div>
                </div>
                <AccessURLTable serviceRefs={serviceRefs} ingressRefs={ingressRefs} />
                <AppNotes notes={app.info && app.info.status && app.info.status.notes} />
                <SecretsTable secretRefs={secretRefs} />
                <DeploymentsTable deployRefs={deployRefs} />
                <ServicesTable serviceRefs={serviceRefs} /> */}
                <OtherResourcesTable otherResources={otherResources} />
              </div>
            </div>
          </div>
        </main>
      </section>
    );
  }

  // parseResources iterates through a list of resources in a manifest and
  // returns the ResourceRefs and otherResources to set in the state.
  private parseResources(
    resources: Array<IResource | IK8sList<IResource, {}>>,
    releaseNamespace: string,
  ): IAppViewState {
    const initial: IAppViewState = {
      resourceRefs: [],
      otherResources: [],
    };
    return resources.reduce((acc, r) => {
      if (!r.kind) {
        // invalid IResource or IK8sList, ignore
        return acc;
      }

      if (r.kind === "List") {
        r = r as IK8sList<IResource, {}>;
        const recurse = this.parseResources(r.items, releaseNamespace);
        return {
          resourceRefs: [...acc.resourceRefs, ...recurse.resourceRefs],
          otherResources: [...acc.otherResources, ...recurse.otherResources],
        };
      }

      r = r as IResource;
      if (["Deployment", "Service", "Ingress", "Secret"].indexOf(r.kind) >= 0) {
        acc.resourceRefs.push(new ResourceRef(r, releaseNamespace));
      } else {
        acc.otherResources.push(r);
      }

      return acc;
    }, initial);
  }

  // private deleteApp = (purge: boolean) => {
  //   return this.props.deleteApp(this.props.releaseName, this.props.namespace, purge);
  // };
}
