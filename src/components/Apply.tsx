import { useState, useEffect } from 'react';
import { submit } from '../utils/request'
import { useNavigate } from 'react-router-dom';

export default function Apply() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate()
    // 获取所有流程模板
    async function getTemplates() {
        try {
            setLoading(true);
            setError('');
            const res = await submit.get('/getAllTemplates', {});
            setTemplates(res);
            console.log('templates', res)
        } catch (e) {
            console.error('获取模板失败:', e);
            setError('获取流程模板失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    }
    //发起申请
    async function startApply(templateId: number, title: string, formData: any) {
        console.log('formData', formData)
        const applyData = {
            templateId,
            title,
            userId: 'student_001',
            formData
        }
        try {
            const res = await submit.post('/createInstance', applyData);

            console.log('发起申请成功:', res);
            navigate(`/student/my-apply/${res.instanceId}`);
        } catch (e) {
            console.error('发起申请失败:', e);
            alert('发起申请失败，请稍后重试');
        }
    }


    useEffect(() => {
        getTemplates();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            {loading ? (
                <div>加载中...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : templates.length === 0 ? (
                <div>暂无流程模板</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {templates.map((template: any) => (
                        <div key={template.templateId} style={{
                            border: '1px solid #e8e8e8',
                            borderRadius: '8px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            backgroundColor: '#fff'
                        }}>
                            <h3 style={{ margin: '0 0 16px 0' }}>{template.title}</h3>
                            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
                                节点数量：{template.flowData?.nodes?.length || 0}
                            </p>
                            <button
                                onClick={() => startApply(template.templateId, template.title, template.flowData)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#1890ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                发起申请
                            </button>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}