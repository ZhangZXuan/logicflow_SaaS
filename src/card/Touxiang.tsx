export default function Touxiang() {
    const userStr = localStorage.getItem("user")
    let user;
    try {
        user = userStr ? JSON.parse(userStr) : {}
    } catch (error) {
        user = {}
    }
    console.log('user', user)
    const username = user.username || "SAAS";
    // 取第一个字/字符
    const firstChar = username.slice(0, 2).toUpperCase();

    return (
        <div
            style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "#1677ff",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
            }}
        >
            {firstChar}
        </div>
    );
};

