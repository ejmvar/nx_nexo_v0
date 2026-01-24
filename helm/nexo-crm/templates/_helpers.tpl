{{/*
Expand the name of the chart.
*/}}
{{- define "nexo-crm.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "nexo-crm.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "nexo-crm.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "nexo-crm.labels" -}}
helm.sh/chart: {{ include "nexo-crm.chart" . }}
{{ include "nexo-crm.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "nexo-crm.selectorLabels" -}}
app.kubernetes.io/name: {{ include "nexo-crm.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
PostgreSQL labels
*/}}
{{- define "nexo-crm.postgresql.labels" -}}
{{ include "nexo-crm.labels" . }}
app.kubernetes.io/component: database
{{- end }}

{{/*
Redis labels
*/}}
{{- define "nexo-crm.redis.labels" -}}
{{ include "nexo-crm.labels" . }}
app.kubernetes.io/component: cache
{{- end }}

{{/*
Keycloak labels
*/}}
{{- define "nexo-crm.keycloak.labels" -}}
{{ include "nexo-crm.labels" . }}
app.kubernetes.io/component: auth
{{- end }}

{{/*
Backend labels
*/}}
{{- define "nexo-crm.backend.labels" -}}
{{ include "nexo-crm.labels" . }}
app.kubernetes.io/component: api
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "nexo-crm.frontend.labels" -}}
{{ include "nexo-crm.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Prometheus labels
*/}}
{{- define "nexo-crm.prometheus.labels" -}}
{{ include "nexo-crm.labels" . }}
app.kubernetes.io/component: monitoring
{{- end }}

{{/*
Grafana labels
*/}}
{{- define "nexo-crm.grafana.labels" -}}
{{ include "nexo-crm.labels" . }}
app.kubernetes.io/component: visualization
{{- end }}
