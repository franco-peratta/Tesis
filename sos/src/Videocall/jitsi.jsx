import { useState, useEffect } from "react"
import PropTypes from "prop-types"

const Jitsi = ({
  loadingComponent,
  errorComponent,
  containerStyles,
  jitsiContainerStyles,
  onError,
  onJitsi,
  displayName,
  ...options
}) => {
  const { loading, error, jitsi } = useJitsi({
    parentNode: "jitsi-container",
    displayName: displayName,
    ...options
  })

  useEffect(() => {
    if (jitsi && onJitsi) onJitsi(jitsi)
  }, [jitsi])

  useEffect(() => {
    if (error && onError) onError(error)
  }, [error])

  return (
    <div style={{ ...{ width: "800px", height: "400px" }, ...containerStyles }}>
      {error && (errorComponent || <p>{error}</p>)}
      {!error && loading && (loadingComponent || <p>Loading ...</p>)}
      <div
        id="jitsi-container"
        style={{
          ...{
            display: loading ? "none" : "block",
            width: "100%",
            height: "100%"
          },
          ...jitsiContainerStyles
        }}
      />
    </div>
  )
}

Jitsi.propTypes = {
  jwt: PropTypes.string,
  domain: PropTypes.string,
  subject: PropTypes.string,
  password: PropTypes.string,
  roomName: PropTypes.string.isRequired,
  displayName: PropTypes.string,
  onMeetingEnd: PropTypes.func,
  loadingComponent: PropTypes.object,
  errorComponent: PropTypes.object,
  containerStyles: PropTypes.object,
  jitsiContainerStyles: PropTypes.object,
  configOverwrite: PropTypes.object,
  interfaceConfigOverwrite: PropTypes.object,
  onError: PropTypes.func,
  onJitsi: PropTypes.func
}

const useJitsi = ({
  domain = "meet.jit.si",
  parentNode,
  subject,
  password,
  displayName,
  onMeetingEnd,
  onParticipantLeft,
  ...options
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [jitsi, setJitsi] = useState(null)

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      setError(
        "JitsiMeetExternalAPI is not available, check if https://meet.jit.si/external_api.js was loaded"
      )
      return
    }

    options.parentNode = document.getElementById(parentNode)
    if (!options.parentNode) {
      setError(
        `Parent node is not available, check container have the correct id: "${parentNode}"`
      )
      return
    }

    const client = new window.JitsiMeetExternalAPI(domain, { ...options })

    setJitsi(client)
    setLoading(false)
    setError(null)

    subject && client.executeCommand("subject", subject)
    // client.executeCommand("displayName", displayName ?? "Anonimo")

    client.addEventListener("videoConferenceJoined", () => {
      console.log("Joined the meeting")
      displayName && client.executeCommand("displayName", displayName)
    })

    client.addEventListener("participantRoleChanged", function (event) {
      if (password && event.role === "moderator") {
        client.executeCommand("password", password)
      }
    })

    client.addEventListener("passwordRequired", () => {
      password && client.executeCommand("password", password)
    })

    client.addEventListener("readyToClose", onMeetingEnd)
    client.addEventListener("participantLeft", onParticipantLeft)

    return () => jitsi && jitsi.dispose()
  }, [window.JitsiMeetExternalAPI])

  return { jitsi, error, loading }
}

useJitsi.propTypes = {
  options: PropTypes.shape({
    domain: PropTypes.string,
    roomName: PropTypes.string.isRequired,
    subject: PropTypes.string,
    password: PropTypes.string,
    displayName: PropTypes.string,
    onMeetingEnd: PropTypes.func,
    onParticipantLeft: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
    parentNode: PropTypes.string,
    configOverwrite: PropTypes.object,
    interfaceConfigOverwrite: PropTypes.object,
    noSSL: PropTypes.bool,
    jwt: PropTypes.string,
    onload: PropTypes.func,
    invitees: PropTypes.array,
    devices: PropTypes.object,
    userInfo: PropTypes.object
  })
}

export { Jitsi, useJitsi }
