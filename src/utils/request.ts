import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios'
//返回的后端结构
export interface ApiResponse<T = any> {
    code: number,
    data: T,
    msg: string
}

function pickHttpErrorMessage(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') return undefined
    const o = data as Record<string, unknown>
    for (const key of ['msg', 'message', 'error'] as const) {
        const v = o[key]
        if (typeof v === 'string' && v.trim()) return v
    }
    return undefined
}

/** 从 axios / 业务 reject 里取出可读说明，便于页面展示 */
export function getRequestErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const fromBody = pickHttpErrorMessage(error.response?.data)
        if (fromBody) return fromBody
        if (error.response?.status === 502) {
            return '无法连接后端，请确认后端已启动且 VITE_PROXY_TARGET 端口正确'
        }
    }
    if (error && typeof error === 'object' && 'msg' in error) {
        const m = (error as ApiResponse).msg
        if (typeof m === 'string' && m.trim()) return m
    }
    return '请求失败，请稍后重试'
}

//创建实例
class Http {
    private instance: AxiosInstance;
    constructor(config: AxiosRequestConfig) {
        this.instance = axios.create(config)
        this.instance.interceptors.request.use(function (config) {
            // 在发送请求之前做些什么
            const token = localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config;
        }, function (error: AxiosError) {
            // 对请求错误做些什么
            return Promise.reject(error);
        });

        // 添加响应拦截器
        this.instance.interceptors.response.use(function (response: AxiosResponse<ApiResponse>) {
            // 2xx 范围内的状态码都会触发该函数。
            // 对响应数据做点什么
            const res = response.data
            if (res.code === 200 || res.code === 0) {
                return res.data
            } else {
                console.error(res.msg || "请求失败")
                return Promise.reject(res)
            }
        }, function (error: AxiosError<ApiResponse>) {
            // 超出 2xx 范围的状态码都会触发该函数。
            // 对响应错误做点什么
            const status = error.response?.status
            const detail =
                pickHttpErrorMessage(error.response?.data) ||
                error.response?.data?.msg ||
                '请求异常'
            switch (status) {
                case 401:
                    console.error(detail || '登录已过期，请重新登录');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error(detail || '无权限访问');
                    break;
                case 404:
                    console.error(detail || '接口不存在');
                    break;
                case 502:
                    console.error(
                        '代理无法连接后端：请确认后端已启动，且 vite.config 中 VITE_PROXY_TARGET 端口正确'
                    );
                    break;
                case 500:
                    console.error(detail !== '请求异常' ? detail : '服务器错误');
                    break;
                default:
                    console.error(detail);
            }
            return Promise.reject(error);
        });
    }
    request<T = any>(config: AxiosRequestConfig): Promise<T> {
        return this.instance.request(config)
    }
    get<T = any>(url: string, config: AxiosRequestConfig): Promise<T> {
        return this.instance.get(url, config)
    }
    post<T = any>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.post(url, data, config)
    }

}

//创建实例并导出
const request = new Http({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3001',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    }
})
export const submit = new Http({
    baseURL: 'http://localhost:3001/api/flow',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})
export default request