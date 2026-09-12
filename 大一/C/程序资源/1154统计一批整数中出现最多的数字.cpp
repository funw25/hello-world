//给定一批整数，分析每个整数的每一位数字，求出现次数最多的数字。
//例如给定3个整数1234、2345、3456，其中出现最多次数的数字是3和4，均出现了3次。
//输入在第1行中给出正整数N（≤1000）
//在第二行中给出N个不超过整型范围的正整数，数字间以空格分隔。
//在一行中按格式“M: n1 n2 ...”输出，其中M是最大次数，n1、n2、……为出现次数最多的数字
//按从小到大的顺序排列，数字间以空格分隔。
#include"stdio.h"
int main()
{
	int n;
	scanf("%d",&n);
	int a[n];
	for(int i=0;i<n;i++){
		scanf("%d",&a[i]);
	}
	// 用于统计0 - 9每个数字出现的次数
    int count[10] = {0};
    // 遍历每个整数，分解每一位并统计数字出现次数
    for(int i=0;i<n;i++) {
        int num=a[i];
        while(num){
            count[num%10]++;
            num/=10;
        }
    }
    // 找到最大出现次数
    int max=0;
    for (int i=0;i<10;i++) {
        if (count[i]>max) {
            max=count[i];
        }
    }
    // 输出结果
    printf("%d:",max);
    for (int i=0;i<10;i++) {
        if (count[i]== max) {
            printf(" %d", i);
        }
    }
    printf("\n");
	return 0;
}
