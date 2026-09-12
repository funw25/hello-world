//本题要求编写程序，根据输入学生的成绩，
//统计并输出学生的平均成绩、最高成绩、最低成绩和低于平均成绩的学生个数。 
//输入第一行首先给出一个正整数N，表示学生的个数。接下来一行给出N个学生的成绩，数字间以空格分隔。
//按照以下格式输出：
//average=平均成绩
//max=最高成绩
//min=最低成绩（以上结果均保留两位小数）
//count=个数
#include"stdio.h"
int main()
{
	int n,sum;
	scanf("%d",&n);
	int a[n];
	for(int i=0;i<n;i++){
		scanf("%d",&a[i]);
	}
	int *p=a;  // 指针p指向数组a，方便后续通过指针操作数组元素
    double max=*p;  // 先假设第一个成绩为最大值，后续进行比较更新
    double min=*p;  // 先假设第一个成绩为最小值，后续进行比较更新

    // 计算成绩总和，同时找出最大值和最小值
    for(int i=0;i<n;i++)
	{
        sum+=*p;
        if(*p>max) 
		max = *p;
        if(*p<min)
		min=*p;
        p++;  // 移动指针指向下一个数组元素
    }

    double average=(double)sum/n;  // 计算平均成绩，注意要转换为double类型计算以得到精确的小数结果
    int count=0;
    p=a;  // 让指针重新指向数组开头，用于统计低于平均成绩的学生个数
    for(int i=0;i<n;i++) {
        if(*p<average)
		count++;
        p++;
    }

    // 按照要求格式输出结果
    printf("average=%.2lf\n", average);
    printf("max=%.2f\n", max);
    printf("min=%.2f\n", min);
    printf("count=%d\n", count);

    return 0;

}
