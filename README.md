# Kubeapps

[![Build Status](https://travis-ci.org/kubeapps/kubeapps.svg?branch=master)](https://travis-ci.org/kubeapps/kubeapps)

<img src="https://github.com/kubeapps/kubeapps/raw/master/img/logo.png" width="100">

Kubeapps is a set of tools written by [Bitnami](https://bitnami.com) to super-charge your Kubernetes cluster with:
 * Your own applications [dashboard](https://kubeapps.com/), allowing you to deploy Kubernetes-ready applications into your cluster with a single click.
 * [Kubeless](http://kubeless.io/) - a Kubernetes-native Serverless Framework, compatible with [serverless.com](https://serverless.com).
 * [SealedSecrets](https://github.com/bitnami/sealed-secrets) - a SealedSecret can be decrypted only by the controller running in the cluster and nobody else (not even the original author).

These tools are easily deployed into your cluster with just one command: ```kubeapps up``` 

----

## Getting started

To get started, read our [Getting Started guide](https://github.com/kubeapps/kubeapps/blob/docs/getting-started.md).

You can also browse the [full documentation](https://github.com/kubeapps/kubeapps/blob/docs).

----
## Build the Kubeapps installer from source

The Kubeapps Installer is a CLI tool written in Go that will deploy all the Kubeapps components into your cluster.
You can build the latest Kubeapps Installer from source. 

### Installing Go
- Visit https://golang.org/dl/
- Download the most recent Go version (here we used 1.9) and unpack the file
- Check the installation process on https://golang.org/doc/install
- Set the Go environment variables

```
export GOROOT=/GoDir/go
export GOPATH=/GoDir/go
export PATH=$GOPATH/bin:$PATH
```

### Create a working directory for the project

```
working_dir=$GOPATH/src/github.com/kubeapps/
mkdir -p $working_dir
```

### Clone kubeapps/kubeapps repository

```
cd $working_dir
git clone https://github.com/kubeapps/kubeapps
```

### Building local binary

```
cd kubeapps
make binary
```

## Testing Kubeapps Installer with minikube

The simplest way to try Kubeapps is deploying it with Kubeapps Installer on [minikube](https://github.com/kubernetes/minikube). 

Kubeapps Installer is now working with RBAC-enabled Kubernetes (v1.7+). You can choose to start minikube vm with your preferred VM driver (virtualbox xhyve vmwarefusion) and a proper Kubernetes version. For example, the [latest minikube](https://github.com/kubernetes/minikube/releases/tag/v0.23.0) will start a Kubernetes v1.8.0.

```
minikube start
```

It's also required to have [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) installed on your machine. Verify Kubernetes version:

```
kubectl version
Client Version: version.Info{Major:"1", Minor:"7", GitVersion:"v1.7.0", GitCommit:"d3ada0119e776222f11ec7945e6d860061339aad", GitTreeState:"clean", BuildDate:"2017-06-29T23:15:59Z", GoVersion:"go1.8.3", Compiler:"gc", Platform:"darwin/amd64"}
Server Version: version.Info{Major:"1", Minor:"8", GitVersion:"v1.8.0", GitCommit:"0b9efaeb34a2fc51ff8e4d34ad9bc6375459c4a4", GitTreeState:"dirty", BuildDate:"2017-10-17T15:09:55Z", GoVersion:"go1.8.3", Compiler:"gc", Platform:"linux/amd64"}
```

Deploy Kubeapps with Kubeapps Installer

```
kubeapps up
```

Remove Kubeapps

```
kubeapps down
```
