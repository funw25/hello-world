//给定两个整型数组，本题要求输出不是两者共有的元素。
//分别在两行中输入两个整型数组中的数据，
//每行先输入一个正整数N（≤20），随后输入N个整数，其间以空格分隔。
//在一行中按照数字给出的顺序输出不是两数组共有的元素
//(先按顺序输出在第一个数组中出现但不在第二个数组中出现的元素，
//然后再按顺序输出在第二个数组中出现但不在第一个数组中出现的元素)，
//数字间以空格分隔。题目保证至少存在一个这样的数字且同一数字不重复输入。
#include"stdio.h" 
int main()
{
	int n,m;
	scanf("%d",&n);
	int a[n];
	for(int i=0;i<n;i++){
		scanf("%d",&a[i]);
	}
	scanf("%d",&m);
	int b[m];
	for(int j=0;j<m;j++){
		scanf("%d",&b[j]);
	}
	for(int k=0;k<n;k++){
		int flag=1;
		for(int l=0;l<m;l++){
			if(a[k]==b[l]){
				flag=0;
				break;
			}
		}
		if(flag){
			printf("%d ",a[k]);
		}
	}
	for(int t=0;t<m;t++){
		int flag=1;
		for(int h=0;h<n;h++){
			if(b[t]==a[h]){
				flag=0;
				break;
			}
		}
		if(flag){
			printf("%d ",b[t]);
		}
	}
	return 0;
}
